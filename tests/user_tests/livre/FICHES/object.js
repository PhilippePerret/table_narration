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
  ["Test des méthodes `add` et `remove`", FICHES_Test_add_et_remove_fiche],
  ["Test de la méthode `dispatch`", FICHES_Test_method_dispatch],
  ["Test de la méthode `fiche`", FICHES_Test_method_fiche],
  ["Test de la méthode `domObj_to_fiche`", FICHES_Method_domObj_to_fiche],
  "Fin"
  ]

  switch(my.step)
  {
  case "Fin":
    break
  default:
    pending("Le test “/var/folders/v6/6wr9_2s90_1428f45_7n6fym0000gn/T/TextMate_snippet_command.xEP6cF: line 4: +my.step+: command not found” doit être implémenté")
  }
  
}

function FICHES_Methodes_et_properties() {
  var props = [
  'current', 'selecteds', 'datatype', 'last_id', 'list', 'length'
  ]
  L(props).each(function(prop){ 'FICHES'.should.have.property(prop)})
  var methods = [
  'add_selected', 'remove_selected', 'add', 'dispatch'
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
  APP.FICHES.selecteds = {}
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
  'FICHES.selecteds'  .should = {}

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

function FICHES_Test_method_dispatch() {
  specs("La méthode `dispatch` permet de dispatcher les fiches (i.e. de les"+
  " créer) lorsqu'elles sont remontées par ajax.")
  APP.FICHES.init_all
  'FICHES.length'.should = 0
  'FICHES.last_id'.should = -1
  'FICHES.list'.should = {}
  
  w("J'envoie à la méthode des fiches artificielles")
  var data = [
  {id:"12", type:'book', titre:"Un titre de livre", opened:false},
  {id:"16", type:'page', titre:"La page d'un autre livre", opened:false,
  enfants:[{id:"1", type:"para"}]},
  {id:"1", type:'para', texte:"Le paragraphe a un texte", ranged:true, 
    parent:{id:16, type:'page'}}
  ]
  
  APP.FICHES.dispatch(data) // <-- TEST
  
  'FICHES.last_id'.should = 16
  'FICHES.length'.should = data.length
  // On vérifie pour chaque fiche
  L([12, 16, 1]).each(function(id){
    ("FICHES.list["+id+"]").should.be.defined
    jq(APP.FICHES.list[id].jid).should.exist
  })
}

function FICHES_Test_method_fiche() {
  specs("La méthode `FICHES.fiche` doit permettre de retourner une instance "+
  "ou des instance de Fiche en fonction d'un object contenant au moins 'id' "+
  "et 'type'. Elle crée la fiche si nécessaire."+
  "\nLa méthode peut recevoir une liste Array d'objets.")
  pending("Implémenter test de `FICHES.fiche`")
}

function FICHES_Method_domObj_to_fiche() {
  specs("La méthode `FICHES.domObj_to_fiche` doit recevoir un objet DOM et "+
  "retourner la fiche correspondante")
  pending("Implémenter le test de `FICHES.domObj_to_fiche`")
}