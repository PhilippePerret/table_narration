/*
 *  Lancement de tous les tests
 *  (en attendant qu'une commande le permette)
 *
 *  To run this: all_tests
 */
function all()
{
  my = all
  
  my.step_list = 
  [
    {name:"Test de l'objet Collection",           test:'Collection/object'},
    {name:"Test des élément de l'UI",             test:'ui/elements'},
    {name:"Test de l'objet Data",                 test:'Divers/Data'},
    {name:"Test de la classe Fiche",              test:'livre/fiche/classe'},
    {name:"Test de la création d'une fiche",      test:'livre/fiche/creation'},
    {name:"Test de la destruction d'une fiche",   test:'livre/fiche/deletion'},
    {name:"Test des éléments DOM d'une fiche",    test:'livre/fiche/display'},
    {name:"Test de la classe Book",               test:'livre/book/class'}
  ]

}
