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
  /**
    * Montrer la page
    *
    * Notes
    * -----
    *   * La méthode est principalement appelée quand on clique sur une référence
    *     dans un texte. Cela produit un appel à `FICHES.show` qui appelle la
    *     méthode `show` propre à chaque type de fiche.
    *   * Pour une page, la montrer consiste à l'ouvrir. Mais cette page peut ne pas
    *     être encore chargée, donc il faut s'assurer qu'elle puisse être ouverte
    *     en chargeant tous ses parents si elle en a.
    *   * Propriété complexe => appeler sans parenthèses. Donc pour les méthodes
    *     poursuivre, il faut utiliser impérativement FICHES.show(this.id, this.type)
    *
    * @method show
    */
  "show":{
    get:function(){
      dlog("-> Page::show ["+this.type_id+"]", DB_FCT_ENTER)
      var pour_suivre = $.proxy(FICHES.show, FICHES, this.id, this.type)
      if(this.loaded == false)
      {
        dlog("La page n'est pas chargée, je dois la charger")
        return this.load('show')
      }
      if(this.parent)
      {
        dlog("La page est dans un chapitre (hors livre ou non, je ne sais pas encore)")
        if(this.parent.loaded){ 
          dlog("Ce chapitre est chargé")
          if(this.parent.is_openable)
          {
            dlog("Ce chapitre est ouvrable")
            if(this.parent.parent)
            {
              // Ne rien faire, le chapitre sera ouvert avec le livre ci-dessous
            }
            else
            {
              dlog("Le chapitre n'appartient pas à un livre, je l'ouvre")
              this.parent.open
            }
          }
          else
          {
            dlog("Ce chapitre doit être rendu ouvrable")
            return this.parent.rend_openable(pour_suivre)
          }
        }
        else
        {
          dlog("Ce chapitre doit être chargé")
          return this.parent.load(pour_suivre)
        }
      }
      if(this.book)
      {
        dlog("La page appartient à un livre")
        // Note: si la page est dans un livre, elle est forcément dans un chapitre
        if(false == this.book.opened){
          dlog("Ce livre n'est pas ouvert")
          if(this.book.loaded){ 
            dlog("Ce livre est chargé")
            if(this.book.is_openable)
            {
              dlog("Ce livre est ouvrable")
              this.book.open              
            }
            else
            {
              dlog("Ce livre n'est pas encore ouvrable (enfants à charger)")
              return this.book.rend_openable(pour_suivre)
            }
          }
          else
          {
            dlog("Ce livre n'est pas chargé")
            return this.book.load(pour_suivre)
          }
        }
        else
        {
          dlog("Le livre est ouvert")
        }
      }
      this.highlight()
    }
  }
  
})