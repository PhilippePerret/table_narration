/*
 * To run this test : Collection/object
 */
function Collection_object()
{
  my = Collection_object
  
  my.step_list = [
    "Existence des propriétés et méthodes de Collection"
  ]

  switch(my.step)
  {
  case  "Existence des propriétés et méthodes de Collection":
    Collection_Existence_properties_and_methods()
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}


function Collection_Existence_properties_and_methods() {
  // Propriétés
  var props = [
    'modified'
  ] 
  L(props).each(function(prop){ 'Collection'.should.have.property( prop )})

  // Propriétés complexes
  var comprops = [
  ]
  L(comprops).each(function(prop){ 'Collection'.should.have.property( prop )})

  // Méthodes
  var methods = [
  
  ]
  L(methods).each(function(method){ 'Collection'.should.respond_to( method )})
}