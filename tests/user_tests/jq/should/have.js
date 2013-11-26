/*
 *  Script de test `pure_js_tests/jq/should/have.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/jq/should/have
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function pure_js_tests_jq_should_have(){

  my = pure_js_tests_jq_should_have
  
  my.specs = "Test des méthodes Should.have de jQ."
    
  my.step_list = [
    "Test de should.have.class",
    "Test de should.have.attr",
    ["Test de should.have.css", jQ_Should_have_css___Method_test]
    ]

  switch(my.step){
  case "Test de should.have.class":
    //... tests
    
    break
  case "Test de should.have.attr":
    // ... tests ...
    break
    
  // case "Test de should.have.css":
  //   // ... tests ...
  //   break
    
  default:
    pending("Test '"+my.step+"' is pending.")
  } // /switch

}

function jQ_Should_have_css___Method_test() {
  jq('div#shouldhave').remove
  
  jq('div#shouldhave').create({
    content:"Un div pour changer le css",
    width:400, height:200, position:"absolute", top:20, left:40
  })
  var myjq = jq('div#shouldhave')
  
  // --- Succès positif ---
  specs("Les retours suivants doivent produire un succès (affirmation)")
  
  myjq.should.have.css('width', "400px")
  myjq.should.have.css('position', "absolute")
  myjq.should.have.css({width:"400px", 'position':"absolute"})
  
  // --- Succès négatif ---
  specs("Les retours suivants doivent produire un succès (négation)")
  
  myjq.should_not.have.css('width', 401)
  myjq.should_not.have.css('rien', "mauvais")
  
  // --- Échecs positif ---
  specs("Les retours suivants doivent produire un échec (positif)")
  myjq.should.have.css('height', 200)
  myjq.should.have.css('width', "401px")
  
  // --- Échecs négatifs ---
  specs("Les retours suivants doivent produire un échec (négation)")
  
  myjq.should_not.have.css('width', '400px')
  
  
  myjq.remove
  
}