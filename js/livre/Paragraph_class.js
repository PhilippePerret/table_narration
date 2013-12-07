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
   *  Concernant le TEXTE du paragraphe
   *  
   */
  "texte_id":{get:function(){return this.dom_id+'-texte'}},
  "texte_jid":{get:function(){ return (this.opened?'textarea':'div')+'#'+this.texte_id }},
  "input_texte":{get:function(){ return $(this.texte_jid)}},
  "texte":{
    get:function(){ return this._texte || null },
    set:function(texte){
      if(texte == this._texte) return
      this._texte = texte
      this.input_texte.val( texte )
      this.modified = true
    }
  },
  /* Code HTML du textarea pour `texte' */
  "html_textarea_texte":{
    get:function(){
      return '<textarea id="'+this.texte_id+'" class="texte">'+this.texte+'</textarea>'
    }
  },
  /* Code HTML du Div pour `texte' */
  "html_div_texte":{
    get:function(){
      return '<div id="'+this.texte_id+'" class="texte">'+this.texte+'</div>'
    }
  },
  /* Place le texte dans un textarea */
  "texte_in_textarea":{
    get:function(){
      this.input_texte.replaceWith(this.html_textarea_texte)
      this.input_texte = $('textarea#'+this.texte_id) // pas vraiment utile (cf. texte_jid)
    }
  },
  /* Place le texte dans un div */
  "texte_in_div":{
    get:function(){
      this.input_texte.replaceWith( this.html_div_texte )
      this.input_texte = $('div#'+this.texte_id) // pas vraiment utile (cf. texte_jid)
    }
  }
  
})