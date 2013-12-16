/**
  * @module Paragraph
  */
/**
  *  Class d'une fiche de type Paragraph
  *
  * @class Paragraph
  *
  */
window.Paragraph = function(data)
{
  if(undefined == data) data = {}
  data.type = 'para'
  Fiche.call(this, data)
}
Paragraph.prototype = Object.create( Fiche.prototype )
Paragraph.prototype.constructor = Paragraph

Object.defineProperties(Paragraph.prototype,{
  
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
        this._next_style = this.style ? DATA_STYLES[this.style[0]].style_after : null
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
      if(PARAGRAPHS.html_menu_styles == null) PARAGRAPHS.build_menu_styles
      this.append_menu_styles
      this.set_style
    }
  },

  /* ---------------------------------------------------------------------
   *  Pour le style du paragraphe
   */
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

/*
 *  Méthode appelée quand on change le texte d'un paragraphe
 *  
 */
Paragraph.prototype.onchange_texte = function(evt)
{
  this.texte = this.textarea_texte.val()
}

/*
 *  Méthode appelée quand on applique les styles choisis pour
 *  le paragraphe.
 *  
 */
Paragraph.prototype.on_change_styles = function(selectors){
  var idm = "Paragraph.on_change_styles("+selectors.join(', ')+") ["+this.type_id+"]"
  dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
  if(selectors.length == 0) selectors = null
  this.style    = selectors
  this.modified = true
  dlog("<- "+idm, DB_FCT_ENTER)
}

