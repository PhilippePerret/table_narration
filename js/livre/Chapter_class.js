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
  
  // /**
  //   * Montrer un chapitre
  //   *
  //   * Notes
  //   * -----
  //   *   * La méthode est principalement appelée quand on clique sur une référence
  //   *     dans un texte. Cela produit un appel à `FICHES.show` qui appelle la
  //   *     méthode `show` propre à chaque type de fiche.
  //   *   * Un chapitre, contrairement à un livre, peut ne pas être affiché
  //   *     On doit donc s'assure qu'il est chargé et ouvrir le livre qui le 
  //   *     contient, sauf lorsqu'il n'appartient à aucun livre.
  //   *
  //   * @method show
  //   * @param  {Object} options cf. `suite_show` in Fiche_DOM.js
  //   */
  // "show":{
  //   value:function(options){
  //     dlog("-> Chapter::show ["+this.type_id+"]", DB_FCT_ENTER)
  //     var pour_suivre = $.proxy(this.show, this, options)
  //     if(!this.loaded) return this.load(pour_suivre)
  //     if(this.parent)
  //     {
  //       if(false == this.book.opened){
  //         if(this.book.loaded) this.book.open
  //         else
  //         {
  //           // Normalement un livre est toujours chargé
  //           // J'ajoute quand même cette sécurité  
  //           this.book.pour_suivre_open = pour_suivre
  //           return this.book.open
  //         }
  //       }
  //     }
  //     this.suite_show(options)
  //   }
  // }
})