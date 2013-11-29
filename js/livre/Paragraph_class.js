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

