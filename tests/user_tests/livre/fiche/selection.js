/*
 * To run this test : livre/fiche/selection
 */
function livre_fiche_selection()
{
  my = livre_fiche_selection
  
  my.specs = "Test de la sélection/déselection d'une fiche."+
  "\nLe test se fait dans tous les cas : avec touche majuscule ou non"
  
  my.step_list = [
  ["Existence des méthodes et propriétés utiles", FicheSelect_Methods_et_properties],
  ["Test de la sélection simple d'une fiche (sans sélection)", FicheSelect_Test_simple],
  ["Test de la sélection simple d'une fiche (avec autre sélection)", FicheSelect_Test_simple_avec_autre_selection],
  ["Test de la sélection multiple de fiches", FicheSelect_Test_selection_multiple]
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
function FicheSelect_Methods_et_properties() {
  blue("Pour `FICHES`")
  APP.FICHES.init_all
  'FICHES'.should.have.property('init_all')
  'FICHES'.should.have.property('selecteds')
  'FICHES.selecteds'.should = {}
  'FICHES'.should.have.property('current')
  'FICHES.current'.should.be.null
  'FICHES'.should.respond_to('add_selected')
  'FICHES'.should.respond_to('remove_selected')
  blue("Pour la classe `Fiche`")
  APP.ifiche = new APP.Fiche()
  var props = [
  'selected'
  ]
  L(props).each(function(prop){ 'ifiche'.should.have.property(prop)})
  var methods = [
  'toggle_select'
  ]
  L(methods).each(function(method){ 'Fiche.prototype'.should.respond_to(method)})
}
function FicheSelect_Test_simple() {
  specs("Test de la simple sélection d'une fiche."+
  "\nOn vérifie d'abord les méthodes (test unitaire) puis on procède ensuite à "+
  "la sélection/déselection de la fiche par clic (test intégration).")
  
  APP.FICHES.init_all
  APP.ipage = new APP.Page()
  var page = APP.ipage
  page.create
  jq(page.jid).should.be.visible
  // OK, la fiche a bien été créée
  'FICHES.current'.should.be.null
  'FICHES.selecteds'.should = {}
  
  w("Je `toggle_select` la fiche")
  page.toggle_select({shiftKey:false}) // <-- TEST
  
  'FICHES.current'.should = page ;
  ('FICHES.selecteds['+page.id+']').should = page
  jq(page.jid).should.have.class('selected')
  'ipage.selected'.should.be.true
  // TODO Vérifier la couleur de la fiche (exergue)
  
  w("Je `toggle_select` à nouveau la fiche (ça ne doit rien changer)")
  page.toggle_select({shiftKey:false}) // <-- TEST
  'FICHES.current'.should = page ;
  ('FICHES.selecteds['+page.id+']').should = page
  jq(page.jid).should.have.class('selected')
  'ipage.selected'.should.be.true

  w("Je `toggle_select` la fiche, mais avec la touche Majuscule appuyée")
  page.toggle_select({shiftKey:true}) // <-- TEST
  'FICHES.current'.should.be.null
  'FICHES.selecteds'.should = {}
  jq(page.jid).should_not.have.class('selected')
  'ipage.selected'.should.be.false
  
  //@note: la dernière fiche doit toujours régler FICHES.current
}

function FicheSelect_Test_simple_avec_autre_selection() {
  pending("À implémenter")
}

function FicheSelect_Test_selection_multiple() {
  pending("À implémenter")
}
