/*
 *  Script de test `pure_js_tests/File/complet.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/File/complet
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function pure_js_tests_File_complet(){

  my = pure_js_tests_File_complet
  
  my.specs =  "Essai des méthodes principales de `File`. On va vérifier la non existence d'un "+
              " fichier, puis le créer en écrivant du texte dedans, puis enfin le détruire, en "+
              "contrôlant chaque fois que le processus s'est passé correctement"
    
  my.step_list = [
    // seek/exists
    "Vérifier la non-existence du fichier",
    // write/written
    "Écrire un message dans le fichier `fichier_inconnu.txt`",
    "Voir si l'écriture s'est bien passée",
    // seek/exists
    "Le fichier devrait bien exister cette fois",
    // load/content
    // "Demander le chargement du fichier",
    "Contrôler le contenu du fichier",
    // delete/deleted
    "Demander la destruction du fichier",
    "Retour de la destruction du fichier",
    // seek/exists
    "Contrôler que le fichier n'existe plus"
    ]

  
  switch(my.step){
  case "Vérifier la non-existence du fichier":
    switch(my.stop_point)
    {
    case 1:
      APP.tested = file('file'+NOW+'.txt')
      return APP.tested.seek_and(2)
    case 2:
      'tested.exists'.should.be.false
      return my.wait.for(0,3)
    case 3:
      APP.tested.should_not.exist
    }
    break
  case "Écrire un message dans le fichier `fichier_inconnu.txt`":
    my.contenu_du_fichier_pour_voir = "Un contenu du fichier pour voir : « Ça c'est l'été »"
    APP.tested.write(my.contenu_du_fichier_pour_voir)
    break
  case "Voir si l'écriture s'est bien passée":
    'tested.written'.should.be.true
    break
  case "Le fichier devrait bien exister cette fois":
    switch(my.stop_point)
    { 
    case 1: 
      return APP.tested.seek_and(2)
    case 2: 
      'tested.exists'.should.be.true
      return my.wait.for(0, 3)
    case 3:
      return APP.tested.should.contain("Ça c'est l'été", 4)
    case 4:
      return APP.tested.should.exist_and(5)
    case 5:
      specs("Je passe par 5, finalement")
      break
    }
    break
  // case "Demander le chargement du fichier":
  case "Contrôler le contenu du fichier":
    return APP.tested.load_and(function() {
      'tested.content'.should = my.contenu_du_fichier_pour_voir})
    break
  // case "Contrôler le contenu du fichier":
  //   'tested.content'.should = my.contenu_du_fichier_pour_voir
  //   break
  case "Demander la destruction du fichier":
    APP.tested.delete
    break
  case "Retour de la destruction du fichier":
    'tested.deleted'.should.be.true
    break
  case "Contrôler que le fichier n'existe plus":
    switch(my.stop_point)
    {
    case 1: APP.tested.seek_and(2); break
    case 2: 'tested.exists'.should.be.false; my.wait.for(0); break
    }
    break
  }// /switch

}
