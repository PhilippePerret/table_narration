/**
  * @module Paragraph
  */
/**
  *  Class d'une fiche de type Paragraph
  *
  * @class    Paragraph
  * @extends  Fiche
  *
  */
window.Paragraph = function(data)
{
  if(undefined == data) data = {}
  data.type   = 'para'
  data.ptype  = 'text'
  Fiche.call(this, data)
}
Paragraph.prototype = Object.create( Fiche.prototype )
Paragraph.prototype.constructor = Paragraph

Object.defineProperties(Paragraph.prototype,{

  /**
    * @property {Book} book Le livre auquel appartient le paragraphe (ou null)
    *
    */
  "book":{
    get:function(){
      if(!this.parent) return null
      return this.parent.book
    }
  },

  /**
    * Le « ptype » du paragraphe indique son type propre, à savoir :
    *   * text  : Un texte "normal" qui sera juste formaté (défaut)
    *   * file  : Un paragraphe qui charge un fichier externe
    *   * code  : Du code à interpréter.
    * @property {String|Null} ptype
    */
  "ptype":{
    get:function(){return this._ptype || null},
    set:function(ptype){
      if(this._ptype == ptype) return
      this._ptype = ptype
    }
  },
  
  /**
    *  Liste des styles du paragraphe (ou null/indéfini)
    *
    * NOTES
    * -----
    *   * Les styles sont définis dans le fichier `./js/data/paragraph_styles.js`
    *     qui est un fichier produit programmatiquement à partir des informations
    *     sur les styles contenus dans `./data/asset/paragraph_styles.txt`.
    *  
    * @property style
    * @type     {Array}
    * @default  {Undefined|Null}
    *
    */
  "style":{
    set:function(selectors){
      if('string'==typeof selectors) selectors = selectors.split('.')
      this._style = selectors
      this.main_field.attr('class', this.class_css)
      delete this._next_style
    },
    get:function(){return this._style}
  },
  
  /**
    * Retourne le style par défaut du paragraphe suivant s'il est défini
    *
    * @property {String} next_style
    */
  "next_style":{
    get:function(){
      if(undefined == this._next_style)
      {
        if(this.style && DATA_STYLES[this.style[0]])
        {
          this._next_style = DATA_STYLES[this.style[0]].style_after
        }
      }
      return this._next_style
    }
  },
  
  /**
    * Retourne le code pour l'attribut `class` de la balise en fonction des styles
    * du paragraphe.
    *
    * @property {String} class_css
    * @default  "" (chaine vide)
    */
  "class_css":{
    get:function(){
      var css = $.merge([], this._style || [])
      css.push('texte')
      return css.join(' ')
    }
  },
  
  /*
   *  Méthode appelée quand on règle le verso de la fiche
   *
   *  Pour un paragraphe, on doit préparer l'affichage si nécessaire
   *  et régler les valeurs propres, comme le style du paragraphe.  
   */
  "after_regle_verso":{
    get:function(){
      this.append_menu_styles
      this.append_menu_ptypes
      this.set_style
    }
  },

  /* ---------------------------------------------------------------------
   *
   *  Pour le `ptype' du paragraphe
   *
   * ---------------------------------------------------------------------*/
  /**
    * DOM Element du menu ptypes
    * Notes
    *   * Le menu des "ptypes" est un select unique, qui se déplace de fiches
    *     en fiche quand on les retourne. La propriété présente renvoie donc
    *     le menu mais seulement quand il se trouve dans son verso.
    * @property {jQuerySet} menu_ptypes
    */
  "menu_ptypes":{get:function(){return $(this.verso.find('select#menu_ptypes'))}},
  /**
    * Déplace le menu des ptypes dans ce paragraphe
    *
    * @method append_menu_ptypes
    */
  "append_menu_ptypes":{
    get:function(){
      if(!PARAGRAPHS.menu_ptypes_ready) PARAGRAPHS.prepare_menu_ptypes
      else $('select#menu_ptypes').unbind('change')
      this.verso.find('div.div_menu_ptypes').append($('select#menu_ptypes'))
      this.menu_ptypes.bind('change', $.proxy(this.onchange_ptype, this))
      this.menu_ptypes.val(this.ptype)
    }
  },
  /* ---------------------------------------------------------------------
   *
   *  Pour le style du paragraphe
   *
   --------------------------------------------------------------------- */
  /* Retourne l'objet DOM jQuery du menu des styles */
  "menu_styles":{get:function(){return $(this.menu_styles_jid)}},
  /* Identifiant du menu */
  "menu_styles_id":{get:function(){return this.dom_id+'-style'}},
  "menu_styles_jid":{get:function(){return "select#"+this.menu_styles_id}},
  /*
   *  Déplace le menu des styles (unique) dans cette fiche
   *  
   */
  "append_menu_styles":{
    get:function(){
      if(!PARAGRAPHS.html_menu_styles) PARAGRAPHS.build_menu_styles
      this.verso.find('.div_menu_styles').append($('div#divuniq_menu_styles'))
    }
  },
  /* Règle le style dans le menu style du paragraphe (verso) */
  "set_style":{
    get:function(){
      // On active tous les styles du paragraphes
      PARAGRAPHS.active_styles( this.style )
    }
  },  
  /*
   *  Concernant le TEXTE du paragraphe
   *  
   */
  "texte_id":{get:function(){return this.dom_id+'-texte'}},
  "textearea_texte_jid":{get:function(){return "textarea#"+this.texte_id}},
  "textarea_texte":{get:function(){return $(this.textearea_texte_jid)}},
  "div_texte_jid":{get:function(){return "div#"+this.texte_id}},
  "div_texte":{get:function(){ return $(this.div_texte_jid)}},
  "texte":{
    get:function(){ return this._texte || null },
    set:function(texte){
      if(texte == this._texte) return
      this._texte = texte
      this.main_field.val( texte )
    }
  },
  
  
  /* Code HTML du textarea pour `texte' */
  "html_textarea_texte":{
    get:function(){
      return '<textarea id="'+this.texte_id+'" class="'+this.class_css+'">'+this.main_field_value(false)+'</textarea>'
    }
  },
  /* Code HTML du Div pour `texte' */
  "html_div_texte":{
    get:function(){
      return '<div id="'+this.texte_id+'" class="'+this.class_css+'">'+this.main_field_value(true)+'</div>'
    }
  }
  
})

$.extend(Paragraph.prototype,{
  /**
    * Méthode appelée quand on modifie le ptype du paragraphe
    *
    * @method onchange_ptype
    * @param  {String} ptype  Le ptype choisi.
    *
    */
  onchange_ptype:function()
  {
    var new_ptype = this.menu_ptypes.val()
    if(new_ptype == this.ptype) return
    this.ptype = new_ptype
    this.update_display
    this.modified = true
  },

  /**
    * Méthode appelée quand on applique les styles choisis pour
    * le paragraphe.
    *
    * @method on_change_styles
    * @param  {Array} selectors   Liste des styles choisis
    */
  on_change_styles:function(selectors){
    var idm = "Paragraph.on_change_styles("+selectors.join(', ')+") ["+this.type_id+"]"
    dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
    if(selectors.length == 0) selectors = null
    this.style    = selectors
    this.modified = true
    dlog("<- "+idm, DB_FCT_ENTER)
  }

})

