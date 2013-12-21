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
  },
  
  /**
    * Monter un chapitre
    *
    * Notes
    * -----
    *   * Un chapitre, contrairement à un livre, peut ne pas être affiché
    *     On doit donc s'assure qu'il est chargé et ouvrir le livre qui le 
    *     contient, sauf lorsqu'il n'appartient à aucun livre.
    *
    * @method show
    *
    */
  "show":{
    value:function(){
      if(this.book)
      {
        if(false == this.book.opened){
          this.book.pour_suivre_open = $.proxy(this.show, this)
          return this.book.open
        }
      }
      this.highlight()
    }
  }
})