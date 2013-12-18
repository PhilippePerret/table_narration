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
  * Méthode partique pour récupérer la position de la table dans la page
  *
  */
function position_table()
{
  if(!this.position_table.pos)
  {
    var pos_table ;
    with(APP){ pos_table = $('section#table').position() }
    this.position_table.pos = pos_table
  }
  return this.position_table.pos
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
    my.pos_table = position_table()
    var booktool = jq('div#card_tool-book')
    dest_pos = offset_tool(200, 100, 'book')
    w("destination pos : x:"+dest_pos.left+" y:"+dest_pos.top)
    booktool.press_and_drag({
      to_x: dest_pos.left,
      to_y: dest_pos.top
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
    'book.jid'.should = "fiche#f-0"
    'book.titre'.should.be.null
    'book.enfants'.should.be.null
    'book.parent'.should.be.null
    'book.is_book'.should.be.true
    'book.is_chapter'.should.be.false
    my.left_book = APP.book.obj.position().left
    my.top_book  = APP.book.obj.position().top
    w("Position du livre = x:"+my.left_book+" y:"+my.top_book)
    w("On doit trouver le livre sur la table, avec les bons éléments DOM."+
    "@note: il s'agit d'un test “léger” qui ne checke pas tous les éléments.")
    var exactjid = "section#table > fiche#f-0"
    var jqfiche = jq(exactjid)
    jqfiche.should.be.visible
    jqfiche.should.have.class('fiche')
    jqfiche.should.have.class('book')
    jq(exactjid+' > recto').should.exist
    jq(exactjid+' > verso').should.exist
    jq(exactjid+' > recto > div.titre').should.exist
    jq(exactjid+' > recto > div.items').should.exist
    
    my.wait.for(0).and(NEXT_POINT)
    break
  case 3:
    blue("On crée un chapitre qu'on glisse directement dans livre")
    w("Je simule un déplacement de l'outil chapitre sur le livre")
    var chaptool = jq('div#card_tool-chap')
    toxy = to_xy_on_fiche('chap', APP.book.obj)
    w("Déplacement du chapitre à x:"+toxy.to_x+" y:"+toxy.to_y)
    chaptool.press_and_drag(toxy)
    my.wait.for(1).and(NEXT_POINT)
    break
  case 4:
    var pos = APP.book.obj.position()
    w("Position du livre = x:"+pos.left+" y:"+pos.top)
    var pos = jq('fiche#f-1').obj.position()
    w("Position du chapitre = x:"+pos.left+" y:"+pos.top)
    w("On doit trouver le chapitre dans les données")
    'FICHES.length'.should = 2
    'FICHES.last_id'.should = 1
    'FICHES.list[1]'.should.be.an_instanceof(APP.Chapter)
    APP.chap = APP.FICHES.list[1]
    'chap.id'.should = 1
    'chap.jid'.should = "fiche#f-1"
    'chap.titre'.should.be.null
    'chap.enfants'.should.be.null
    'chap.is_book'.should.be.false
    'chap.is_chapter'.should.be.true
    
    // Vérification de l'appartenance au livre
    'chap.parent.id'.should.be = 1
    
    my.wait.for(1).and(NEXT_POINT)
    break
    
  }
  
  
}