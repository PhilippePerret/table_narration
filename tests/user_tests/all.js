/*
 *  Lancement de tous les tests
 *  (en attendant qu'une commande le permette)
 *
 *  To run this: all
 */
function all()
{
  my = all
  
  my.step_list = 
  [
    "Préparation des tests",
    {name:"Test de l'objet Collection",           test:'Collection/object'},
    {name:"Test des élément de l'UI",             test:'ui/elements'},
    {name:"Test de l'objet Data",                 test:'Divers/Data'},
    {name:"Test de la classe Fiche",              test:'livre/fiche/classe'},
    {name:"Test de la création d'une fiche",      test:'livre/fiche/creation'},
    {name:"Test de la destruction d'une fiche",   test:'livre/fiche/deletion'},
    {name:"Test des éléments DOM d'une fiche",    test:'livre/fiche/display'},
    {name:"Test de la classe Book",               test:'livre/book/class'},
    "Fin des tests"
  ]

  switch(my.step)
  {
  case "Préparation des tests":
    APP.alert("La page de l'application doit être active pour certains tests")
    break
  case "Fin des tests":
    // Pour focuser à nouveau sur cette page
    window.focus()
    // alert("Tests finis")
    break
    
  default:
    pending("Le test “" +my.step+"” doit être implémenté")
  }
  
}
