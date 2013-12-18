/*
 * To run this test : integration/creation_complete
 */
function integration_creation_complete()
{
  my = integration_creation_complete
  my.NO_MARK_STOP_POINT = true
  
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
    alert("Ce test nécessite votre intervention.\n\nToutes les actions en orange doivent être exécutées\nà la main.")
    w("Destruction de la collection test…")
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
  * Méthode à appeler pour bloquer une boucle sur le stop point +stop_point+
  * en attendant qu'une action soit faite à la main par exemple.
  * Doit être placé dans le case du stop-point concerné, et être appelé
  * si la condition est fausse. Par exemple :
  * @example
  *     ...
  *     case 4:
  *       if( jq('objet_attenud').exists == false ){bloc_on(4); break}
  *       delete my.bloc_on_counter
  *       ...
  *
  * Requis
  * ------
  *   * Penser à remettre `delete my.bloc_on_counter` après la réussite
  *
  * @method bloc_on
  * @param  {Number} stop_point L'index du stop-point sur lequel s'arrêter.
  * @param  {Number} duree      Le temps d'arrêt (2 par défaut)
  *
  */
function bloc_on(stop_point, duree)
{
  if(undefined == duree) duree = 2
  if(!my.bloc_on_counter) my.bloc_on_counter = 0
  else my.bloc_on_counter += 1
  if(my.bloc_on_counter > 10){
    warning("J'ai attendu trop longtemps, je renonce.")
    return my.end()
  }
  my.wait.for(duree, '').and(stop_point)
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
  
    /**
      * On règle les préférences de l'application
      *
      */
    w("Réglage des préférences de l'application")
    APP.App.preferences.autosave  = false
    jq('input#cb_automatic_save').obj_dom.checked = false
    APP.Collection.enable_automatic_saving(false)
    APP.App.preferences.snap      = false
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
    // Le livre dans les données FICHES
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
    'book.selected'.should.be.false
    my.left_book = APP.book.obj.position().left
    my.top_book  = APP.book.obj.position().top
    w("Position du livre = x:"+my.left_book+" y:"+my.top_book)
    'Collection.modifieds_list.length'.should = 1
    
    // Le livre dans le DOM
    w("On doit trouver le livre sur la table, avec les bons éléments DOM."+
    "@note: il s'agit d'un test “léger” qui ne checke pas tous les éléments.")
    var exactjid = "section#table > fiche#f-0"
    var jqfiche = jq(exactjid)
    jqfiche.should.be.visible
    jqfiche.should.have.class('fiche')
    jqfiche.should.have.class('book')
    jq(exactjid+' > recto').should.exist
    jq(exactjid+' > verso').should.exist
    jq(exactjid+' > recto > div.items').should.exist
    
    // On essaie de changer son titre
    w("On change le titre du livre")
    divtitre = jq(exactjid+' > recto > div.titre')
    divtitre.should.exist
    divtitre.click_with({meta:true})
    divtitre.should_not.existe
    inputTitre = jq(exactjid+' > recto > input.titre')
    inputTitre.should.exist
    'book.selected'.should.be.true
    
    // Le titre doit être édité
    // Tout ça ne fonctionne pas, malgré tous les essais différents
    // 'UI.Input.target.id'.should = APP.book.id
    // inputTitre.obj_dom.value = "Le titre du livre"
    // inputTitre.press({key_code:K_RETURN})
    
    my.wait.for(1).and(NEXT_POINT)
    break
  case 3:
    // À la faire à la main : glisser un chapitre sur le livre
    blue("On crée un chapitre qu'on glisse directement dans livre")
    // w("Je simule un déplacement de l'outil chapitre sur le livre")
    // var chaptool = jq('div#card_tool-chap')
    // toxy = to_xy_on_fiche('chap', APP.book.obj)
    // w("Déplacement du chapitre à x:"+toxy.to_x+" y:"+toxy.to_y)
    // // pour voir où il est
    // // NE PAS UTILISER LA SOURIS pour changer d'onglet, faire CMD+ALT+<-
    // // toxy.no_mouse_up = true 
    // chaptool.press_and_drag(toxy)
    // my.wait.for(1).and(NEXT_POINT)
    faire("\n-> GLISSER UN CHAPITRE SUR LE LIVRE ET REVENIR\n")
    my.wait.for(2, '').and(NEXT_POINT)
    break
  case 4:
    
    // Arrêt en attendant que ça soit fait
    if(jq('fiche#f-1').exists == false){bloc_on(4);break}
    delete my.bloc_on_counter
    
    var pos = jq('fiche#f-1').obj.position()
    w("Position du chapitre = x:"+pos.left+" y:"+pos.top)
    w("On doit trouver le chapitre dans les données")
    'FICHES.length'.should = 2
    'FICHES.last_id'.should = 1
    'FICHES.list[1]'.should.be.an_instanceof(APP.Chapter)
    'Collection.modifieds_list.length'.should = 2
    APP.chap = APP.FICHES.list[1]
    'chap.id'.should = 1
    'chap.jid'.should = "fiche#f-1"
    'chap.titre'.should.be = "TITRE_CHAPITRE"
    'chap.enfants'.should.be.null
    'chap.is_book'.should.be.false
    'chap.is_chapter'.should.be.true
    // 
    // Vérification de l'appartenance au livre (dans les données)
    w("Le chapitre doit avoir été apparenté au livre")
    'chap.parent.id'.should.be = 0
    'book.enfants.length'.should = 1
    'book.enfants[0].id'.should = 1
    'book.enfants[0].type'.should = 'chap'
    
    // Vérification des éléments dans le DOM
    w("Le chapitre doit se trouver au bon endroit sur la table (dans le livre)")
    objchap = jq('fiche#f-1')
    objchap.should.exist
    objchap.should.have.class('ranged')
    objchap.should_not.have.class('opened')
    objchap.should.be.contained_by('fiche#f-0 > recto > div.items')
    
    my.wait.for(1).and(NEXT_POINT)
    break
    
  case 5:
    // On crée un deuxième chapitre
    faire("\n-> Glisser un autre chapitre sur le livre et revenir")
    my.wait.for(0).and(NEXT_POINT)
    break
  case 6:
    if(jq('fiche#f-2').exists == false){bloc_on(6);break}
    delete my.bloc_on_counter
    
    var pos = jq('fiche#f-2').obj.position()
    w("Position du second chapitre = x:"+pos.left+" y:"+pos.top)
    w("On doit trouver le chapitre dans les données")
    'FICHES.length'.should = 3
    'FICHES.last_id'.should = 2
    'FICHES.list[2]'.should.be.an_instanceof(APP.Chapter)
    'Collection.modifieds_list.length'.should = 3
    APP.chap = APP.FICHES.list[2]
    'chap.id'.should = 2
    'chap.jid'.should = "fiche#f-2"
    'chap.titre'.should.be = "TITRE_CHAPITRE"
    'chap.enfants'.should.be.null
    'chap.is_book'.should.be.false
    'chap.is_chapter'.should.be.true
    // 
    // Vérification de l'appartenance au livre (dans les données)
    w("Le chapitre doit avoir été apparenté au livre")
    'chap.parent.id'.should.be = 0
    'book.enfants.length'.should = 2
    'book.enfants[1].id'.should = 2
    'book.enfants[1].type'.should = 'chap'
    
    // Vérification des éléments dans le DOM
    w("Le chapitre doit se trouver au bon endroit sur la table (dans le livre)")
    objchap = jq('fiche#f-2')
    objchap.should.exist
    objchap.should.have.class('ranged')
    objchap.should_not.have.class('opened')
    objchap.should.be.contained_by('fiche#f-0 > recto > div.items')
    objchap.should.be.after('fiche#f-1')
    
    my.wait.for(1).and(NEXT_POINT)
    break
  case 6:
    blue("Vérification sur les fichiers")
    file('./collection/test/fiche/book/0.msh').should_not.exist.and(NEXT_POINT)
    break
  case 7:
    file('./collection/test/fiche/chap/1.msh').should_not.exist.and(NEXT_POINT)
    break
  case 8:
    blue("On sauve l'application (en cliquant sur le bouton “auto”)")
    'Collection.timer_save'.should.be.null
    presse_bouton_auto_save()
    w("Le time save doit être démarré")
    'Collection.timer_save'.should_not.be.null
    'Collection.timer_save'.should.be.a_number
    w("On attend la fin de la sauvegarde…")
    my.wait.while(function(){return APP.Collection.saving == true}).and(NEXT_POINT)
    break
  case 9:
    'Collection.modifieds_list'.should.be.undefined
    file('./collection/test/fiche/book/0.msh').should.exist.and(NEXT_POINT)
    break
  case 10:
    file('./collection/test/fiche/chap/1.msh').should.exist.and(NEXT_POINT)
    break
  case 11:
    file('./collection/test/fiche/chap/2.msh').should.exist.and(NEXT_POINT)
    break
  case 16:
    // Garder pour la fin
    w("Je passe par 16")
    my.wait.for(0)
    break
  default:
    my.wait.for(0)
  }
  
  
}