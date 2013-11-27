/*
 * To run this test : Collection/object
 */
function Collection_object()
{
  my = Collection_object
  
  my.step_list = [
    "Existence des propriétés et méthodes de Collection",
    "Test des fonctions asynchrones"
  ]

  switch(my.step)
  {
  case  "Existence des propriétés et méthodes de Collection":
    Collection_Existence_properties_and_methods()
    break
    
  case "Test des fonctions asynchrones":
    Collection_Test_fonctions_asynchrones()
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
  'add_modified'
  ]
  L(methods).each(function(method){ 'Collection'.should.respond_to( method )})
}

function Collection_Test_fonctions_asynchrones() {
  
  blue("Test de `add_modified` (pour ajouter un élément à sauver)")
  APP.Collection.modifieds_list = undefined
  'Collection.modifieds_list'.should.be.null
  APP.ibook = new APP.Book()
  APP.Collection.add_modified( APP.ibook ) // <-- TEST
  'Collection.modifieds_list'.should_not.be.null
  'Collection.modifieds_list'.should.be.an_array
  'Collection.modifieds_list'.should.contain( APP.ibook )
  
  w("En marquant une fiche modifiée, elle doit s'enregistrer dans la liste par `add_modified`")
  APP.ibook2 = new APP.Book()
  APP.ibook2.modified = true // <-- TEST
  'Collection.modifieds_list.length'.should = 2
  'Collection.modifieds_list'.should.contain( APP.ibook2 )
  
}