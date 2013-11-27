/*
 *  Class Page
 *  ----------
 *  Pour la gestion d'une fiche de type Page
 *  
 */
window.Page = function(data)
{
  if(undefined == data) data = {}
  data.type = 'page'
  Fiche.call(this, data)
}
Page.prototype = Object.create( Fiche.prototype )
Page.prototype.constructor = Page

