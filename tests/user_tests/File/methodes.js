/*
 *  Script de test `pure_js_tests/File/methodes.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/File/methodes
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function pure_js_tests_File_methodes(){

  my = pure_js_tests_File_methodes
  
  my.specs = "Test de la classe _TFile (et la fonction `file') qui permet d'interagir avec les fichiers de l'application."
    
  my.step_list = [
    "Test de l'existence des méthodes et propriétés de la class _TFile",
    "Test de l'association entre l'instance _TFile et le scriptp appelant",
    "Test de l'écriture d'un fichier dans l'application",
    "Test de l'existence d'un fichier dans l'application"
    ]

  my.before_all = function(){
    APP._TFile = _TFile
  }
  my.after_all = function(){delete APP._TFile}
  
  
  switch(my.step){
  case "Test de l'existence des méthodes et propriétés de la class _TFile":
    File_Existence_Methodes_et_Proprietes()
    break
  case "Test de l'association entre l'instance _TFile et le scriptp appelant":
    blue("Test à l'intérieur de la fonction principale de test")
    APP.afile = file('un/fichier/quelconque')
    'afile.script'.should.be.defined
    'afile.script'.should_not.be.null
    'afile.script.function_name'.should = "pure_js_tests_File_methodes"
    blue("Test à l'intérieur d'une fonction appelée par la fonction principale de test")
    TFile_Association_TFile_et_script()
    break
  case "Test de l'écriture d'un fichier dans l'application":
    // ... tests ...
    break
    
  case "Test de l'existence d'un fichier dans l'application":
    // ... tests ...
    break
    
  default:
    pending("Test '"+my.step+"' is pending.")
  } // /switch

}


function File_Existence_Methodes_et_Proprietes() {
  
  var methodes = ['write']
  L(methodes).each(function(method) '_TFile.prototype'.should.respond_to(method))
  
  var properties = [
  'script', 'poursuit',
  'exist', 'exists',
  'should','should_not',
  'load', 
  'delete'
  ]
  L(properties).each(function(property) '_TFile.prototype'.should.have.property(property))
  
  var props_instance = [
  '_script'
  ]
  APP.a_file = file('path/to/file')
  L(props_instance).each(function(prop) 'a_file'.should.have.property(prop))
}

function TFile_Association_TFile_et_script() {
  APP.anotherfile = my.file('un/fichier/quelconque')
  'anotherfile.script'.should.be.defined
  'anotherfile.script'.should_not.be.null
  'anotherfile.script.function_name'.should = "pure_js_tests_File_methodes"
}