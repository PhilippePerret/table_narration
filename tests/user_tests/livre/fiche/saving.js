/*
 * To run this test : livre/fiche/saving
 */
function livre_fiche_saving()
{
  my = livre_fiche_saving
  
  my.specs = "Test de la sauvegarde des fiches"
  
  my.step_list = [
  ["Préparation du test", FicheSave_Prepare_test],
  ["Méthodes et propriétés utiles", FicheSave_Methodes_et_properties],
  ["Dossiers et fichiers indispensables", FicheSave_Dossiers_et_fichiers],
  ["Test de la méthode `data`", FicheSave_Methode_data],
  // @note: Laisser ce test juste en dessous du test de `data', c'est plus
  // prudent.
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

function FicheSave_Prepare_test() {
  specs("Principalement, on arrête la boucle de sauvegarde de la collection.")
  APP.Collection.stop_automatic_saving
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
    return file('./ruby/ajax/fiche/save.rb').should.exist.and(NEXT_POINT)
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
  switch(my.stop_point)
  {
  case 1:
    specs("On sauve les fiches créées dans l'étape précédente")
    return file('./collection/test/fiche/page/'+APP.ipage.id+".js").should_not.exist.and(NEXT_POINT)
  case 2:
    return file('./collection/test/fiche/chap/'+APP.ichap.id+".js").should_not.exist.and(NEXT_POINT)
  case 3:
    return file('./collection/test/fiche/para/'+APP.ipara1.id+".js").should_not.exist.and(NEXT_POINT)
  case 4:
    w("On lance la sauvegarde des fiches créées ci-dessus")
    APP.FICHES.save(null) // <-- TEST
    return my.wait.while(function(){ return APP.FICHES.saving }).and(NEXT_POINT)
  case 5:
    return file('./collection/test/fiche/page/'+APP.ipage.id+".js").should.exist.and(NEXT_POINT)
  case 6:
    return file('./collection/test/fiche/chap/'+APP.ichap.id+".js").should.exist.and(NEXT_POINT)
  case 7:
    return file('./collection/test/fiche/para/'+APP.ipara1.id+".js").should.exist.and(NEXT_POINT)
  case 8:
    return file('./collection/test/fiche/para/'+APP.ipara2.id+".js").should.exist.and(NEXT_POINT)
  }
  
  
}
