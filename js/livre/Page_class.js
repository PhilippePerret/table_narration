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
  },
  // /**
  //   * Montrer la page
  //   *
  //   * Notes
  //   * -----
  //   *   * La méthode est principalement appelée quand on clique sur une référence
  //   *     dans un texte. Cela produit un appel à `FICHES.show` qui appelle la
  //   *     méthode `show` propre à chaque type de fiche.
  //   *   * Pour une page, la montrer consiste à l'ouvrir. Mais cette page peut ne pas
  //   *     être encore chargée, donc il faut s'assurer qu'elle puisse être ouverte
  //   *     en chargeant tous ses parents si elle en a.
  //   *   * Propriété complexe => appeler sans parenthèses. Donc pour les méthodes
  //   *     poursuivre, il faut utiliser impérativement FICHES.show(this.id, this.type)
  //   *
  //   * @method show
  //   */
  // "show":{
  //   value:function(options){
  //     dlog("-> Page::show ["+this.type_id+"]", DB_FCT_ENTER)
  //     var pour_suivre = $.proxy(this.show, this, options)
  //     if(!this.loaded == false) return this.load(pour_suivre)
  //     if(this.parent)
  //     {
  //       this.parent.pour_suivre_open = pour_suivre
  //       return this.parent.open
  //     }
  //     else
  //     {
  //       this.suite_show(options)
  //     }
  //   }
  // }
  
})