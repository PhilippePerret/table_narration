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

$.extend(Page.prototype,{
  
  /**
    * Méthode appelée après l'ouverture de la page (`open` commun à tous les
    * type de fiche)
    *
    * @method after_open
    */
  after_open:function(){
    if(this.enfants){
      L(this.enfants).each(function(child){child.applique_filtre})
    }
  }
})
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
  /**
    * Retourne le titre de la page pour affichage dans une référence
    *
    * @property {String} titre_for_ref
    */
  "titre_for_ref":{
    get:function(){return this.titre}
  }
  
})