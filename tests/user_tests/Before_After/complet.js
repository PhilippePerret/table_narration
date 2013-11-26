/*
 *  Script de test `pure_js_tests/Before_After/complet.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/Before_After/complet
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function pure_js_tests_Before_After_complet(){

  my = pure_js_tests_Before_After_complet
  
  if(!APP.counter) APP.counter = 1

  my.specs =  "Ce test doit permettre de s'assurer que les méthodes BEFORE_ALL, BEFORE_EACH, "+
              "AFTER_EACH et AFTER_ALL sont bien invoquées et bien invoquées au bon moment "+
              "en fonction de la situation."+
              "\nSurveiller particulièrement la méthode BEFORE_ALL, qui utilise une attente, "+
              "et la deuxième étape qui utilise des points d'arrêt."
  
  my.before_all = function(){
    w("-> BEFORE_ALL")
    w("Je suis un before_all asynchrone.")
    APP.counter += 1
    'counter'.should = 2
    my.wait.for(4)
  }

  my.step_list = [
    // seek/exists
    "1. Un test à jouer, sans stop point",
    "2. Un test à jouer, avec des stop points",
    "3. Une étape sans attente",
    "4. Et une autre aussi sans attente",
    "5. Un dernier test"
    ]

  // - Ne fonctionne pas bien si après définition step list -
  // my.before_all = function(){
  //   w("-> BEFORE_ALL")
  //   my.wait.for(4)
  // }
 

  my.after_all = function(){
    w("-> AFTER_ALL")
    APP.counter += 1
    'counter'.should = 20
    APP.counter = undefined
    delete APP.counter
  }
  my.before_each = function(){
    w("-> BEFORE_EACH")
    APP.counter += 1
  }
  my.after_each = function(){
    w("-> AFTER_EACH")
    APP.counter += 1
  }
  
  switch(my.step){
  case "3. Une étape sans attente":
    w("Je joue l'étape sans attente")
    APP.counter += 1
    'counter'.should = 12
    break
  case "4. Et une autre aussi sans attente":
    w("Je joue l'autre étape sans attente")
    APP.counter += 1
    'counter'.should = 15
    break
  case "1. Un test à jouer, sans stop point":
    w("Je joue un test à jouer sans stop point puis j'attends 2 secondes")
    APP.counter += 1
    'counter'.should = 4
    my.wait.for(2)
    break
  case "2. Un test à jouer, avec des stop points":
    switch(my.stop_point)
    {
    case 1:
      w("je passe par le stop point 1")
      APP.counter += 1
      'counter'.should = 7
      my.wait.for(1, 2)
      break
    case 2:
      w("Je passe par le stop point 2")
      APP.counter += 1
      'counter'.should = 8
      my.wait.for(2, 3)
      break
    case 3:
      w("Je passe par le stop point 3")
      APP.counter += 1
      'counter'.should = 9
      my.wait.for(0)
      break
    }
    break
  case "5. Un dernier test":
    w("Je joue le dernier test")
    APP.counter += 1
    'counter'.should = 18
    break
  }// /switch
  
}
