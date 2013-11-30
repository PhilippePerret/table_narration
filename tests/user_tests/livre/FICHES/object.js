/*
 * To run this test : livre/FICHES/object
 */
function livre_FICHES_object()
{
  my = livre_FICHES_object
  
  my.specs = "Test de l'objet FICHES"
  
  my.step_list = [
  ["Existence des propriétés et méthodes", FICHES_Methodes_et_properties],
  ["Test de la méthode `init_all`", FICHES_Test_init_all],
  ["Test des méthodes `add` et `remove`", FICHES_Test_add_et_remove_fiche]
  ]

}

function FICHES_Methodes_et_properties() {
  var props = [
  'current', 'selecteds', 'datatype', 'last_id', 'list', 'length'
  ]
  L(props).each(function(prop){ 'FICHES'.should.have.property(prop)})
  var methods = [
  'add_selected', 'remove_selected', 'add'
  ]
  L(methods).each(function(method){ 'FICHES'.should.respond_to(method)})
  
}

function FICHES_Test_init_all() {
  specs("La méthode `init_all` doit ré-initialiser tout ce qui concerne les fiches."+
  "\n@note: Cette méthode est donc surtout utile pour les tests, puisqu'il n'y a pour "+
  "le moment qu'une seule collection contenant toutes les fiches")
  
  w("On crée des fiches qu'on dépose sur la table")
  APP.FICHES.last_id = -1
  APP.FICHES.list = {}
  APP.FICHES.selecteds = null
  APP.FICHES.current = null
  // Préparation
  APP.ibook = new APP.Book(); APP.ibook.create;
  APP.ipage = new APP.Page(); APP.ipage.create;
  APP.ichap = new APP.Chapter(); APP.ichap.create;
  APP.ipara = new APP.Paragraph(); APP.ipara.create;
  APP.FICHES.add_selected(APP.ipage, keep = true)
  'FICHES.last_id'.should = 3
  'FICHES.length' .should = 4
  'FICHES.current'.should = APP.ipage
  jq(APP.ibook.jid).should.be.visible
  jq(APP.ipage.jid).should.be.visible
  jq(APP.ichap.jid).should.be.visible
  jq(APP.ipara.jid).should.be.visible
  
  w("J'appelle `FICHES.init_all`…")
  APP.FICHES.init_all // <-- TEST

  jq(APP.ibook.jid).should_not.exist
  jq(APP.ipage.jid).should_not.exist
  jq(APP.ichap.jid).should_not.exist
  jq(APP.ipara.jid).should_not.exist
  
  'FICHES.last_id'    .should = -1
  'FICHES.list'       .should = {}
  'FICHES.length'     .should = 0
  'FICHES.current'    .should.be.null
  'FICHES.selecteds'  .should.be.null

}

function FICHES_Test_add_et_remove_fiche() {
  specs("Les méthodes `add` et `remove` doivent permettre d'ajouter et de retirer une fiche dans `FICHES.list` "+
  "et de tenir à jour la propriété `length`. Ces méthodes sont appelées "+
  "principalement par la classe `Fiche` quand une fiche est instanciée ou supprimée.")
  APP.FICHES.init_all
  'FICHES.length'.should = 0
  'FICHES.list'.should = {}
  
  w("J'instancie la fiche")
  APP.ifiche = new APP.Page()
  
  'FICHES.length'.should = 1 ;
  ('FICHES.list['+APP.ifiche.id+']').should = APP.ifiche
  
  w("Je remove la fiche")
  APP.FICHES.remove( APP.ifiche )
  
  'FICHES.length' .should = 0
  'FICHES.list'   .should = {}
}