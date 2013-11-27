/*
 * To run this test : livre/book/class
 */
function livre_book_class()
{
  my = livre_book_class
  
  my.step_list = [
  "Test rapide des méthodes et propriétés héritées de Fiche",
  "Existence des propriétés et méthodes propres au livre"
  ]

  switch(my.step)
  {
  case "Test rapide des méthodes et propriétés héritées de Fiche":
    Livre_Quick_test_inherit_from_Fiche()
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}


function Livre_Quick_test_inherit_from_Fiche() {
  
}