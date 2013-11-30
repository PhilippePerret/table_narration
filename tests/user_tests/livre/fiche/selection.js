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
  'FICHES.selecteds'.should.be.null
  'FICHES'.should.have.property('current')
  'FICHES.current'.should.be.null
  'FICHES'.should.respond_to('add_selected')
  'FICHES'.should.respond_to('remove_selected')
  blue("Pour la classe `Fiche`")
  var props = [
  'selected'
  ]
  L(props).each(function(prop){ 'Fiche.prototype'.should.have.property(prop)})
  var methods = [
  'toggle_select'
  ]
  L(methods).each(function(method){ 'Fiche.prototype'.should.respond_to(method)})
}
function FicheSelect_Test_simple() {
  pending("À implémenter")
  //@note: la dernière fiche doit toujours régler FICHES.current
}

function FicheSelect_Test_simple_avec_autre_selection() {
  pending("À implémenter")
}

function FicheSelect_Test_selection_multiple() {
  pending("À implémenter")
}
