/*
 * To run this test : livre/fiche/raccourcis
 */
function livre_fiche_raccourcis()
{
  my = livre_fiche_raccourcis
  
  my.specs = "Test des raccourcis clavier sur les fiches."
  
  my.step_list = [
  "Préparation",
  ["Test sur la fiche sélectionnée", Fiche_Shortcuts_on_selected]
  ]

  switch(my.step)
  {
  case "Préparation":
    blue("ACTIVEZ L'APPLICATION POUR CES TESTS EN CLIQUANT SUR SON ONGLET.")
    my.wait.for(5)
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function Fiche_Shortcuts_on_selected() {
  
  var page = APP.ipage
  
  switch(my.stop_point)
  {
  case 1:
    specs("Test des raccourcis sur une fiche sélectionnée (hors champ en édition).")
    APP.FICHES.init_all
    page = APP.ipage = create_page({titre:"Le titre de la page"})
  
    blue("La touche `O` doit permettre d'ouvrir la fiche, la touche `F` doit permettre de la fermer")
    Keyboard.press( APP.K_RETURN ) // pour sortir du champ d'édition
    return my.wait.for(1).and(NEXT_POINT)
  case 2:
    page.select
    'ipage.selected'.should.be.true
    Keyboard.press(APP.Key_o) // <-- TEST
    return my.wait.for(1).and(NEXT_POINT)
  case 3:
    'ipage.opened'.should.be.true
    Keyboard.press(APP.Key_f) // <-- TEST
    return my.wait.for(1).and(NEXT_POINT)
  case 4:
    'ipage.opened'.should.be.false
    Keyboard.press(APP.Key_o) // <-- TEST
    return my.wait.for(1).and(NEXT_POINT)
  case 5:
    'ipage.opened'.should.be.true
    return my.wait.for(1).and(NEXT_POINT)
  case 6:
    blue("La touche `Effacement arrière` doit afficher une boite de confirmation de la suppression de la fiche.")
    Keyboard.press( APP.K_RETURN ) // pour sortir du champ d'édition
    Keyboard.press( APP.K_ERASE ) // <-- TEST
    return my.wait.for(1).and(NEXT_POINT)
  case 7:
    jq("div.edit_box#kill_fiche").should.exist
    var question = jq('div.edit_box#kill_fiche > div.title')
    question.should.exist
    question.should.contain(LOCALE.fiche['want delete fiche'])
    var cb_kill_enfants = jq('div.edit_box#kill_fiche > div.fields > div#div_kill_children')
    cb_kill_enfants.should.exist
    cb_kill_enfants.should.contain(APP.LOCALE.fiche['kill children'])
    my.wait.for(0)
  }
  
  
  
}

