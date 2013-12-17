/*
 * To run this test : integration/creation_complete
 */
function integration_creation_complete()
{
  my = integration_creation_complete
  
  my.specs = "Ce test d'intégration permet de tester la création d'une collection."
  
  my.step_list = [
  "Effacement de la collection Test actuelle et vérification",
  "Attente que l'application soit prête",
  ["Premiers tests", CreationCollection_Premiers_tests]
  ]

  switch(my.step)
  {
  case "Effacement de la collection Test actuelle et vérification":
    // On doit utiliser le script ajax collection/destroy et vérifier que la collection
    // ait bien été détruite. La page est rechargée en fin de processus.
    APP.Collection.destroy
    my.wait.while.file('./collection/test/liste').exists
    break
  case "Attente que l'application soit prête":
    my.wait.until(function(){return APP.ready == true})
    break
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}


/**
  * Premiers tests de la collection
  *
  * @method CreationCollection_Premiers_tests
  */
function CreationCollection_Premiers_tests()
{
  switch(my.stop_point)
  {
  case 1:
    specs("Les premiers tests vont consister à essayer de créer un livre contenant "+
    "différents éléments (chapitres, pages)")
  
    /*
     *  On vérifie quelques valeurs qui doivent en être là
     *  
     */
    'FICHES.list'.should = {}
    'FICHES.length'.should = 0
    'FICHES.last_id'.should = -1
    
    /*
     *  Je vais essayer de déplacer l'outil du livre sur la page
     *  
     */
    w("Je simule un déplacement de l'outil livre")
    var pos_table ;
    with(APP){ pos_table = $('section#table').position() }
    my.pos_table = pos_table
    var booktool = jq('div#card_tool-book')
    booktool.press_and_drag({
      to_x: my.pos_table.left  + 200,
      to_y: my.pos_table.top   + 100
    })
    // On attend un tout petit peu que le livre soit construit
    my.wait.for(0.5).and(NEXT_POINT)
    break
  case 2:
    w("On doit trouver le livre dans les données")
    'FICHES.length'.should = 1
    'FICHES.last_id'.should = 0
    'FICHES.list[0]'.should.be.an_instanceof(APP.Book)
    APP.book = APP.FICHES.list[0]
    'book.id'.should = 0
    'book.titre'.should.be.null
    'book.enfants'.should.be.null
    'book.parent'.should.be.null
    
    w("On doit trouver le livre sur la table")
  
    my.wait.for(1).and(NEXT_POINT)
    break
  case 3:
  
    my.wait.for(0)
  }
  
  
}