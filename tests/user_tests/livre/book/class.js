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
    
  case "Existence des propriétés et méthodes propres au livre":
    Livre_Existence_own_properties_and_methods()
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}


function Livre_Quick_test_inherit_from_Fiche() {
  APP.ibook1 = new APP.Book()
  var id1 = 1 * APP.FICHES.last_id
  'ibook1.type' .should = 'book'
  APP.ibook2 = new APP.Book()
  var id2 = 1 * APP.FICHES.last_id
  'ibook2.type' .should = 'book'
  'ibook1.id'   .should = id1
  'ibook2.id'   .should = id2
  'ibook1.modified'.should.be.defined
  'ibook1'.should.respond_to('dispatch')
  'ibook1'.should.respond_to('add_child')
  'ibook1'.should.respond_to('remove_child')
}

/*
 *  Propriétés et Méthodes propres au livre
 *  (@note: revient à se demander : qu'est-ce que fait le livre que ne font pas
 *   les autres types de fiche ?)
 */
function Livre_Existence_own_properties_and_methods() {
  var methods = [
  ]
  L(methods).each(function(meth){'Book.prototype'.should.respond_to(meth)})
  var props = [
  ]
  L(props).each(function(prop){'Book.prototype'.should.have.property(prop)})
  // Propriétés complexes
  var compprops = [
  'real_titre'
  ]
  L(compprops).each(function(prop){'Book.prototype'.should.have.property(prop)})
}