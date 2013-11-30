/*
 * To run this test : livre/fiche/saving
 */
function livre_fiche_saving()
{
  my = livre_fiche_saving
  
  my.specs = "Test de la sauvegarde des fiches"
  
  my.step_list = [
  ["Méthodes et propriétés utiles", FicheSave_Methodes_et_properties],
  ["Dossiers et fichiers indispensables", FicheSave_Dossiers_et_fichiers],
  ["Test de la méthode `data`", FicheSave_Methode_data],
  ["Test de la sauvegarde d'une simple fiche", FicheSave_Test_simple]
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
function FicheSave_Methodes_et_properties() {
  var methods = [
  ]
  L(methods).each(function(method){ 'Fiche.prototype'.should.respond_to(method)})
  
  var props = [
  'data', 'save'
  ]
  L(props).each(function(prop){ 'Fiche.prototype'.should.have.property(prop)})
}

function FicheSave_Dossiers_et_fichiers() {
  switch(my.stop_point)
  {
  case 1:
    return file('./collection').should.exist.and(NEXT_POINT)
    // my.wait.for(1).and(NEXT_POINT)
    // break
  case 2:
    return file('./ruby/ajax').should.exist.and(NEXT_POINT)
  case 3:
    return file('./ruby/ajax/fiche/save_fiches.rb').should.exist.and(NEXT_POINT)
    // my.wait.for(0)
  case 4:
    
    my.wait.for(0).and(NEXT_POINT)
    break
    
  }
  
}
function FicheSave_Methode_data() {
  specs("La méthode `data` doit retourner les données à enregistrer dans "+
  "le fichier de la fiche.")
  
  blue("Test pour une page (contenant des enfants et un parent)")
  APP.ichap = new APP.Chapter()
  var chap = APP.ichap
  chap.create
  
  APP.ipage = new APP.Page()
  var page = APP.ipage
  page.create
  chap.add_child(page)
  
  APP.ipara1 = new APP.Paragraph()
  var para1 = APP.ipara1
  para1.create
  page.add_child(para1)
  APP.ipara2 = new APP.Paragraph()
  var para2 = APP.ipara2
  para2.create
  page.add_child(para2)
  
  var titre = "Le titre de la page " + Time.now()
  page.dispatch({
    titre: titre,
    // TODO: Ajouter ici les autres propriétés (type_page, level, etc.)
  })
  
  'ipage.data'.should = {
    id:page.id, type:'page',
    deleted:false,
    titre:titre,
    opened:true, ranged:false,
    parent:{id:chap.id, type:'chap'},
    enfants:[
      {id:para1.id, type:'para'}, {id:para2.id, type:'para'}
    ]
  }
}


function FicheSave_Test_simple() {
  pending("à implémenter")
  // Après la sauvegarde, la fiche ne doit plus être marquée modifiée
}
