/*
 * To run this test : ui/methods
 */
function ui_methods()
{
  my = ui_methods
  
  my.specs = "Test des méthodes de l'Interface utilisateur"
  
  my.step_list = [
  ["Existence des méthodes", UI_Existence_methodes]
  ]

  switch(my.step)
  {
  case "/* step name */":
    /* test */
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function UI_Existence_methodes() {
  'UI'.should.be.defined
  var methods = [
  'ondrop_on_table'
  ]
  L(methods).each(function(method){'UI'.should.respond_to(method)})
  var props = [
    'prepare', 'preparing', 'prepared'
  ]
  L(props).each(function(prop){'UI'.should.have.property(prop)})
  'UI.prepared'.should.be.true
  'UI.preparing'.should.be.false
}
