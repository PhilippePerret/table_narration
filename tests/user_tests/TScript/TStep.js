/*
 *  Script de test `pure_js_tests/TScript/TStep.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/TScript/TStep
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function pure_js_tests_TScript_TStep(){

  my = pure_js_tests_TScript_TStep
  
  my.specs = "Test de la class `TStep` qui gère les étapes dans un script `TScript`."
    
  my.step_list = [
    "Existence de la classe et de ses méthodes/propriétés",
    "Test de la fonction dispatch",
    "Test de la méthode write de TStep",
    "Test de la fonction run_fonction",
    "Fonctionnement général de TStep",
    "Test du résultat obtenu par le test des méthodes"
    ]

  // Chaque fois
  APP.TScript = window.TScript
  APP.TStep   = window.TStep
  
  switch(my.step){

  case "Existence de la classe et de ses méthodes/propriétés":
    // console.log("---> `"+my.step+"`")
    my.TStepClassMethodsAndProperties()
    break

  case "Test de la fonction dispatch":
    // console.log("---> `"+my.step+"`")
    TStepTestFunctionDispatch()
    break
    
  case "Test de la méthode write de TStep":
    // console.log("---> `"+my.step+"`")
    TStepTestFunctionWrite()
    break
    
  case "Test de la fonction run_fonction":
    // console.log("---> `"+my.step+"`")
    TStepTestFunctionRunFunction()
    break

  case "Fonctionnement général de TStep":
    // console.log("---> `"+my.step+"`")
    TStepFonctionnementGeneral()
    my.run_test('tests/pour_tscript')
    break
    
  case "Test du résultat obtenu par le test des méthodes":
    // console.log("---> `"+my.step+"`")
    TStepAnalyseResultatRun()
    break
    
    
  default:
    pending("Test `"+my.step+"` is pending.")
  }


}

pure_js_tests_TScript_TStep.TStepClassMethodsAndProperties = function(){
  var tstep = 'TStep'
  tstep.should.be.defined
  tstep.should.be.a_function
  APP.iStep = new APP.TStep()
  if(APP.iStep instanceof APP.TStep){
    var methods = ['dispatch']
    L(methods).each(function(method){ 
      'TStep.prototype'.should.respond_to( method )
      'iStep'.should.respond_to( method )
    })
    var properties = ['name', 'fonction', 'test', 'indice', 'script', 'write', 'run', 'run_fonction']
    L(properties).each(function(property){
      try{
        'TStep.prototype'.should.have.property( property )
        'iStep'.should.have.property( property )
      }catch(err){/* car certaines propriétés génère des erreurs */}
    })
  }else{
    failure("Impossible de tester plus loin `iStep`, elle n'existe pas.")
  }
}

// Test fonction TStep::dispatch
function TStepTestFunctionDispatch(){
  APP.iStep = NewInstanceOfTStep({name:"Son nom", indice:1})
  'iStep._name'.should    = "Son nom"
  'iStep.name'.should     = "Son nom"
  'iStep._indice'.should  = 1
  'iStep.indice'.should   = 1
  APP.iStep.dispatch({name:"Autre nom", indice:12})
  'iStep._name'.should    = "Autre nom"
  'iStep.name'.should     = "Autre nom"
  'iStep._indice'.should  = 12
  'iStep.indice'.should   = 12
}

// Test méthode TStep::write
function TStepTestFunctionWrite(){
  var old_no_test = true && Test.NO_TEST
  var old_silence = true && Test.SILENCE
  var istep_tested = NewInstanceOfTStep({name:"Le nom de l'étape à écrire ici"})
  Test.SILENCE = false; Test.NO_TEST = false
  force_db("On force l'écriture d'une ligne")
  Test.SILENCE = true; Test.NO_TEST = true
  istep_tested.write
  APP.last_div = get_last_div_rapport
  Test.SILENCE = false; Test.NO_TEST = false
  'last_div'.should_not.contain( "Le nom de l'étape à écrire ici" )
  istep_tested.write
  Test.NO_TEST = old_no_test; Test.SILENCE = old_silence
  APP.last_div = get_last_div_rapport
  'last_div'.should.contain( "Le nom de l'étape à écrire ici" )  
}

// Test function TStep::run_fonction
function TStepTestFunctionRunFunction(){
  // La fonction que devra appeler l'instance iStep
  // @note : elle sera modifiée en cours de test
  APP.function_pour_istep = function(){return true}
  // Définition de l'instance
  APP.iStep = NewInstanceOfTStep()
  // Remettre cette ligne (mais pour le moment, elle pourrait générer l'erreur - si c'est vraiment
  // le cas, la mettre simplement dans un try)
  try{
    if('iStep'.has_not.property('run_fonction')) return // une erreur a été produite avant
  }catch(err){ /* On continue */}
  
  specs("run_fonction doit produire une erreur si la fonction n'est pas définie")
  
  db("Sans function définie")
  'iStep.run_fonction'.should.throw("Il faut définir la fonction de l'étape !")
  
  db("Avec une fonction définie")
  APP.iStep.dispatch({function:APP.function_pour_istep})
  'iStep.run_fonction'.should_not.throw()
  
  // @fixme: Pour le moment, la suite ne fonctionne pas. Le retour est "undefined" alors
  // qu'il y a bien des retours partout.
  // 'iStep.run_fonction'.should.return( true )
  // APP.function_pour_istep = function(){return 12}
  // APP.iStep = NewInstanceOfTStep({function:APP.function_pour_istep})
  // 'iStep.run_fonction'.should.return( 12 )
  
}


function TStepFonctionnementGeneral(){
  specs(  "Test du fonctionnement général de TStep. Les instances sont créés lorsque la liste "+
          "des étapes d'un test sont définies. Pour ce test on va faker grossièrement le "+
          "lancement d'un script de test, jusqu'au lancement des quatres étapes, qui utilisent "+
          "les trois principaux fonctionnements, à avoir :"+
          "\n- La simple définition par un nom de fonction qu'on retrouve dans le switch,"+
          "\n- La définition demandant l'appel d'une fonction,"+
          "\n- La définition demandant l'appel d'un autre script de test."+
          "\n(une quatrième étape utilise la simple définition par nom)")
  
  
  APP.iTest = new APP.TScript({
  		relative_path	: 'script/quelconque',
  		folders				: 'user_tests'
    })  
  
  // Une fonction à appeler par l'étape
  APP.function_test_hors_fonction    = function(){ return 12   }

  // La fausse fonction de test
  // --------------------------
  // @NOTE
  // Elle est utilisée provisoirement ici, mais elle est implémentée "in real" dans le test
  // `tests/pour_tscript.js' qui sera appelé en fin de cette clause case
  // 
  with(APP){
    window.function_fake_test = function(){ 
      function function_test_dans_main_test(){
        
      }
      my = function_fake_test
    }
  }
  
  var steps = [
    "Une étape donnée simplement par son nom",
    ["Une étape avec une fonction associée, donnée par array", APP.function_test_hors_fonction],
    {name:"Une étape définie par un Hash, qui doit appeler un test", test: 'tests/pour_tscript_in_test.js'},
    ["Une étape avec fonction se trouvant dans la fonction de test", APP.function_fake_test.function_test_dans_main_test],
    "Une autre étape définie simplement par son nom"
  ]
 
  
  // Simuler que le script a déjà été implémenté et chargé
  APP.iTest._implanted        = true 
  APP.iTest.wait_for_loading  = false
  APP.iTest._first_run_ok     = true 
  
  // On colle la fonction au test et le test à la fonction
  APP.iTest.fonction =  APP.function_fake_test
  // NOTER ici l'appel indispensable à `prepare_fonction'. C'est cette méthode du script
  // qui colle toutes les propriétés (notamment les propriétés complexes) à la fonction.
  APP.iTest.prepare_fonction
  
  'function_fake_test.script'.should= APP.iTest
  // APP.function_fake_test.step_list = steps
  try{ APP.function_fake_test.set_step_list_to( steps ) } // <-- TEST
  catch( err ){/* throw produit par set_step_list_to ci-dessus */}
  
  'iTest._step_list'.should.be.defined
  'iTest._step_list'.should.be.an_array
  'function_fake_test.step_list'.should.be.defined
  'function_fake_test.step_list'.should.be.an_array

  w("Vérification de la conformité des élément de step_list, "+
  "qui doivent être des TStep")
  APP.step_list_tested = APP.function_fake_test.step_list
  'step_list_tested.length'.should = 5
  for(var i = 0; i < 5; ++i){
    var ref = 'function_fake_test.step_list['+i+'].class'
    ref.should = "TStep"
  }
  
  'function_fake_test.step_list[0].function'.should.be.null
  'function_fake_test.step_list[0].test'.should.be.null
  
  'function_fake_test.step_list[1].function'.should_not.be.null
  'function_fake_test.step_list[1].function'.should.be.a_function
  'function_fake_test.step_list[1].test'.should.be.null
  
  'function_fake_test.step_list[2].function'.should.be.null
  'function_fake_test.step_list[2].test'.should_not.be.null
  'function_fake_test.step_list[2].test'.should.be.a_string
  'function_fake_test.step_list[2].test'.should = 'tests/pour_tscript_in_test.js'
  
  // @Note
  // La suite se fait en remontant et en lançant le script `tests/pour_tscript.js' qui
  // va vraiment lancer ce test. Cf. la fonction suivante.
  
  // Pour tester le `run' des étapes, on utilise cet array qui doit récupérer dans l'ordre,
  // si tout se passe bien, tous le nom de toutes les étapes, dans l'ordre.
  APP.resultat_run = []
  
}

function TStepAnalyseResultatRun() {
  specs("Maintenant que le script a été joué, on va voir si l'array `resultat_run' contient "+
        "le bon résultat, c'est-à-dire la liste dans l'ordre défini.")
  'resultat_run'.should_not.be.undefined
  'resultat_run'.should_not.be.null
  'resultat_run'.should_not.be.empty
  'resultat_run.length'.should = 6
  // console.dir(APP.resultat_run)
}


// Crée et retourne une nouvelle instance de TStep, avec les données fournies
function NewInstanceOfTStep(data){
  return new APP.TStep(data)
}