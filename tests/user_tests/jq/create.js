/*
 *  Script de test `pure_js_tests/jq/create.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/jq/create
 *
 *  @contact: phil@atelier-icare.net
 *  @wiki:    https://github.com/PhilippePerret/PureJavascriptTests/wiki
 *
 */
function pure_js_tests_jq_create(){

  I = pure_js_tests_jq_create
  
  I.specs("Test de la fonction jQ.create(...) qui doit permettre de créer un élément dans le DOM de l'application testée.")    
    
  I.step_list = [
    "jQ doit connaitre la méthode",
    "jQ.create doit renvoyer une erreur en cas de données incorrectes",
    "jQ.create doit créer correctement l'élément s'il est bien défini"
    ]

  
  if(I.run_step(
    "jQ doit connaitre la méthode"
  )){
    
    var myjq = jq('div#inconnu')
    if('function' == typeof myjq.create) success("jQ connait la méthode `create'")
    else failure("jQ devrait connaitre la méthode `create'")

  }
  else if(I.run_step(
    "jQ.create doit renvoyer une erreur en cas de données incorrectes"
  )){
  
    var myjq = jq('div')
    // myjq.create().must_throw(LOCALES.errors.jq['create_need_data'])

  }
  else if(I.run_step(
    "jQ.create doit créer correctement l'élément s'il est bien défini"
  )){
    L(['div#inconnu', 'div#inconnu_deux', 'div.inconnu_trois','div#div_draggable'
    ]).each(function(jid){ jq(jid).remove})
    
    w("\nCréation en fournissant un jid entier avec identifiant (div#id)", BLUE)
    var myjq = jq('div#inconnu_deux')
    myjq.create()
    myjq.should.exist
    
    w("\nCréation en fournissant un jid entier avec class (div.class)", BLUE)
    var myjq = jq('div.inconnu_trois')
    myjq.create()
    myjq.should.exist
    myjq.remove
    
    w("\nCréation en fournissant un jid balise et des données", BLUE)
    var myjq = jq('div').create({
      id:"inconnu",
      width:200, height:100,
      left:400, top:100, 
      style:{ position:'absolute', 'background-color': "blue"},
      content:"Un texte dans le div",
      class:"class_inconnue"
    })
    myjq.should.exist
    myjq.should.contain("Un texte dans le div")
    myjq.should.be.at(400, 100)
    myjq.should.have.class('class_inconnue')
    myjq.remove
    
    w("\nCréation d'un div draggable", BLUE)
    myjq = jq('div#div_draggable').create({draggable:true, left:100, top:200})
    myjq.should.be.at(100, 200)
    myjq.press_and_drag({to_x:300, to_y:600})
    myjq.should.be.at(300, 600)
    myjq.remove
    
  }
}
