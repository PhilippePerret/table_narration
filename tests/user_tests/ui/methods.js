/*
 * To run this test : ui/methods
 */
function ui_methods()
{
  my = ui_methods
  
  my.specs = "Test des méthodes de l'Interface utilisateur"
  
  my.step_list = [
  ["Existence des méthodes", UI_Existence_methodes],
  ["Test du voyant de sauvegarde de l'application", UI_Voyant_sauvegarde]
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

function UI_Existence_methodes() {
  'UI'.should.be.defined
  var methods = [
  'ondrop_on_table'
  ]
  L(methods).each(function(method){'UI'.should.respond_to(method)})
  var props = [
    'prepare', 'preparing', 'prepared'
  ]
  L(props).each(function(prop){'UI'.should.have.property(prop)})
  'UI.prepared'.should.be.true
  'UI.preparing'.should.be.false
}

function UI_Voyant_sauvegarde() {
  specs("Le voyant de sauvegarde doit indiquer l'état de sauvegarde de la "+
  "collection.")
  APP.Collection.modified = false // <-- TEST
  var mark_not_saved  = jq('section#header span#mark_saved_no')
  var mark_saved      = jq('section#header span#mark_saved_yes')
  var mark_saved_forb = jq('section#header span#mark_saved_forbidden')
  mark_not_saved.should.exist
  mark_not_saved.should_not.be.visible
  mark_saved.should.exist
  mark_saved.should.be.visible
  mark_saved_forb.should.exist
  mark_saved_forb.should_not.be.visible
  
  w("On passe la collection à modifiée")
  APP.Collection.modified = true // <-- TEST
  mark_not_saved.should.be.visible
  mark_saved.should_not.be.visible
  mark_saved_forb.should_not.be.visible
  
  w("On focusse dans un champ d'édition")
  APP.ipage = new APP.Page()
  APP.ipage.create
  jq(APP.ipage.titre_jid).obj.select() // <-- TEST
  mark_saved.should_not.be.visible
  mark_not_saved.should_not.be.visible
  mark_saved_forb.should.be.visible

  w("On repasse la collection à non modifiée")
  APP.Collection.modified = false // <-- TEST
  mark_not_saved.should_not.be.visible
  mark_saved.should.be.visible
  
}
