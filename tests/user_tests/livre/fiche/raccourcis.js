/*
 * To run this test : livre/fiche/raccourcis
 */
function livre_fiche_raccourcis()
{
  my = livre_fiche_raccourcis
  
  my.specs = "Test des raccourcis clavier sur les fiches."
  
  my.step_list = [
  ["Test sur la fiche sélectionnée", Fiche_Shortcuts_on_selected]
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

function Fiche_Shortcuts_on_selected() {
  specs("Test des raccourcis sur la fiche sélectionnée.")
  create_page({titre:"Le titre de la page"})
  
  blue("La touche `O` doit permettre d'ouvrir la fiche, la touche `F` doit permettre de la fermer")
  Keyboard.press(Key_o)
  
}