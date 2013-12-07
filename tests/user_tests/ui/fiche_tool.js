/*
 * To run this test : ui/fiche_tool
 */
function ui_fiche_tool()
{
  my = ui_fiche_tool
  
  my.specs = "Test des outils-fiche qui permettent de créer et choisir des fiches"
  
  my.before_all = function(){reload_app()}
  
  my.step_list = [
  ["Test de l'existence des propriétés et méthodes de `CardTools`", CardTools_Methodes_et_properties],
  "Fin"
  ]

  switch(my.step)
  {
  case "Fin":
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function CardTools_Methodes_et_properties() {
  'CardTools'.should.be.defined
  if(false == 'CardTools'.is.defined) return failure("Test impossible, `CardTools` doit être défini")
  'CardTool'.should.be.a_function
  
  // Méthodes de l'instance CardTool
  var methods = [
  
  ]
  L(methods).each(function(method){'CardTool'.should.respond_to(method)})
  // Méthodes de l'instance CardTool
  var props = [
  'draggable', 'undraggable', 'open', 'close',
  'mousedown', 'mouseup', 'dblclick'
  ]
  L(props).each(function(prop){'CardTool'.should.have.property(prop)})
  
}