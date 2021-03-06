/*
 * To run this test : Collection/object
 */
function Collection_object()
{
  my = Collection_object
  
  my.step_list = [
    ["Existence des propriétés et méthodes de Collection", Collection_Existence_properties_and_methods],
    ["Test des fonctions synchrones", Collection_Test_fonctions_synchrones],
    ["Test de la méthode `dispatch`", Collection_Method_dispatch],
    ["Test de la méthode `dispatch_data`", Collection_Dispatch_data],
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


function Collection_Existence_properties_and_methods() {
  
  // Propriétés
  var props = [
    'saving', 'loading'
  ] 
  L(props).each(function(prop){ 'Collection'.should.have.property( prop )})

  // Propriétés complexes
  var comprops = [
  'disable_save', 'modified', 'regle_mark_saved', 
  'stop_automatic_saving', 'start_automatic_saving'
  ]
  L(comprops).each(function(prop){ 'Collection'.should.have.property( prop )})

  // Méthodes
  var methods = [
  'add_modified', 'dispatch', 'dispatch_data',
  'ondrop_on_table'
  ]
  L(methods).each(function(method){ 'Collection'.should.respond_to( method )})
}

function Collection_Test_fonctions_synchrones() {
  
  blue("Test de `add_modified` (pour ajouter un élément à sauver)")
  APP.Collection.modifieds_list = undefined
  'Collection.modifieds_list'.should.be.null
  APP.ibook = new APP.Book()
  w("Ajout d'un livre à la liste des fiches modifiées")
  APP.Collection.add_modified( APP.ibook ) // <-- TEST
  'Collection.modifieds_list'.should_not.be.null
  'Collection.modifieds_list'.should.be.an_array
  'Collection.modifieds_list.length'.should = 1
  ArrayShouldContainObjectWith('Collection.modifieds_list', {id: APP.ibook.id, type:'book', class:'Fiche'})
    
  w("En marquant une fiche modifiée, elle doit s'enregistrer dans la liste par `add_modified`")
  APP.ibook2 = new APP.Book()
  APP.ibook2.modified = true // <-- TEST
  'Collection.modifieds_list.length'.should = 2
  ArrayShouldContainObjectWith(
    'Collection.modifieds_list', {id: APP.ibook2.id, type:'book', class:'Fiche'})
  
}

function Collection_Method_dispatch() {
  switch(my.stop_point)
  {
  case 1:
    specs("La méthode `Collection.dispatch` permet de distribuer les données remontées "+
    "par la requête Ajax `collection/load`.")

    w("On initialise les fiches pour repartir à zéro")
    FICHES.init_all
    'FICHES.length' .should = 0
    'FICHES.list'   .should = {}

    Collection.load // <-- TEST
    return my.wait.while(function(){return Collection.loading == true}).and(NEXT_POINT)
  case 2:
  
    my.wait.for(1).and(NEXT_POINT)
    break
  case 3:
  
    my.wait.for(0)
  }
  
  
}

function Collection_Dispatch_data() {
  pending("Implémenter le test de la méthode `Collection.dispatch_data`.")
}