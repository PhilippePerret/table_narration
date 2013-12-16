/**
  * @module Chapter
  */
/**
  * Class pour les chapitres
  * @class Chapter
  * @extends Fiche
  */
window.Chapter = function(data)
{
  if(undefined == data) data = {}
  data.type = 'chap'
  Fiche.call(this, data)
}
Chapter.prototype = Object.create( Fiche.prototype )
Chapter.prototype.constructor = Chapter

Object.defineProperties(Chapter.prototype,{
  /**
    * @property {Book} book Le livre auquel appartient le chapitre (ou null)
    *
    */
  "book":{
    get:function(){
      if(!this.parent) return null
      return this.parent
    }
  }
})