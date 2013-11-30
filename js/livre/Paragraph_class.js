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
  "texte_jid":{get:function(){ return 'textarea#'+this.dom_id+"-texte" }},
  "input_texte":{get:function(){ return $(this.texte_jid)}},
  "texte":{
    get:function(){ return this._texte || null },
    set:function(texte){
      if(texte == this._texte) return
      this._texte = texte
      this.input_texte.val( texte )
      this.modified = true
    }
  }
})