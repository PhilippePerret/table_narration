/**
  * @module Page
  */
/**
  * Pour la gestion d'une fiche de type Page
  *
  * @class Page
  */
window.Page = function(data)
{
  if(undefined == data) data = {}
  data.type = 'page'
  Fiche.call(this, data)
}
Page.prototype = Object.create( Fiche.prototype )
Page.prototype.constructor = Page

Object.defineProperties(Page.prototype,{
  /**
    * @property {Book} book Le livre auquel appartient la page (ou null)
    *
    */
  "book":{
    get:function(){
      if(!this.parent) return null
      return this.parent.book
    }
  }
})