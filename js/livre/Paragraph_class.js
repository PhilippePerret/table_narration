/*
 *  Class Paragraph
 *  ---------------
 *  Pour la gestion d'une fiche de type Paragraph
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
  
  /*
   *  Méthode appelée quand on règle le verso de la fiche
   *
   *  Pour un paragraphe, on doit préparer l'affichage si nécessaire
   *  et régler les valeurs propres, comme le style du paragraphe.  
   */
  "after_regle_verso":{
    get:function(){
      if(this.menu_styles_is_not_ready) this.prepare_menu_styles
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
  /* Prépare le menu des styles de paragraphe */
  "prepare_menu_styles":{
    get:function(){
      var m = '<div class="div_menu_styles">'+
                '<span class="libelle">Style</span>' +
                '<select id="'+this.menu_styles_id+'" class="menu_styles">' ;
      L(STYLES_PARAGRAPHES).each(function(sty, dstyle){
        
      })
      m += '</select></div>'
      $(m).insertAfter(this.fieldset_parametres.firstChild())
    }
  },
  /* Règle le style dans le menu style du paragraphe (verso) */
  "set_style":{
    get:function(){
      
    }
  },
  "on_change_style":{
    get:function(){
      
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
      return '<textarea id="'+this.texte_id+'" class="texte">'+this.main_field_value+'</textarea>'
    }
  },
  /* Code HTML du Div pour `texte' */
  "html_div_texte":{
    get:function(){
      return '<div id="'+this.texte_id+'" class="texte">'+this.main_field_value+'</div>'
    }
  }
  
})