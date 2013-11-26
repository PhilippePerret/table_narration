/*
 *  Script de test `pure_js_tests/Cookie/unit.js'
 *
 *  To run it, copy and past in Pure-JS-Test : pure_js_tests/Cookie/unit
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 *
 *  NOTE
 *  ----
 *  Ce test est autant un test des cookies pour une utilisation dans une application 
 *  que les méthodes de test en elles-mêmes.
 *
 */
function pure_js_tests_Cookie_unit(){

  my = pure_js_tests_Cookie_unit
  
  my.specs = "Tests unitaires pour les cookies"
    
  my.step_list = [
    "Test de l'existence des méthodes",
    "Test de l'existence des propriétés",
    "Test du fonctionnement des méthodes générales",
    "Test de la propriété complexe expireDate",
    "Test de la pseudo propriété expireToUTCString",
    "Test de la pseudo méthode code",
    "Test de la pseudo méthode create",
    "Test de la fonction cookie créant une instance cookie",
    "Test des méthodes de test"
    ]

  APP._PJsT_Cookie = _Cookie
  
  switch(my.step){
  case "Test de l'existence des méthodes":
    Cookie_Existence_Methodes()
    break
  case "Test de l'existence des propriétés":
    Cookie_Existence_Propriétés()
    break
  case "Test du fonctionnement des méthodes générales":
    Cookie_Fonctionnement_methodes_generales___test()
    break
    
  case "Test de la propriété complexe expireDate":
    Cookie_ExpireDate___ComplexProperty_test()
    break
  case "Test de la pseudo propriété expireToUTCString":
    Cookie_expireToUTCString___Property_test()
    break
  case "Test de la pseudo méthode code":
    Cookie_Code___ComplexProperty_test()
    break
  case "Test de la pseudo méthode create":
    Cookie_Create___ComplexProperty_test()
    break
  case "Test de la fonction cookie créant une instance cookie":
    Cookie_Fonction_Cookie_creant_instance()
    break
  case "Test des méthodes de test":
    Cookie_Test_methodes_test___test()
    break
  default:
    pending("Test '"+my.step+"' is pending.")
  } // /switch

}

function Cookie_Existence_Methodes() {
  var methodes = ['expire_in', 'expire_at']
  L(methodes).each(function(method){
    '_PJsT_Cookie.prototype'.should.respond_to(method)
  })
}

function Cookie_Existence_Propriétés() {
  var properties = [
  "value", "get", "create", "delete", 'expireDate', 'expireToUTCString', 'should', 'should_not',
  'exists', 'exist',
  ]
  L(properties).each(function(property){
    '_PJsT_Cookie.prototype'.should.have.property(property)
  })
  
}

function Cookie_Code___ComplexProperty_test() {

  // code doit retourner un code valide. On va faire simple d'abord, puis ensuite
  // avec un hash stringifié par JSON
  var nom = "cookie"+Time.now()
  var val = "Sa valeur simple"
  APP.coo = cookie(nom)
  APP.coo._expire = 1
  APP.coo._value  = val
  'coo.code'.should = nom + '=' + val + '; expires='+APP.coo.expireToUTCString+'; path=/'
  
  var val = {une:"valeur", plus:"complexe"}
  APP.coo.value = val
  'coo.code'.should = nom + '=' + JSON.stringify(val) + '; expires='+APP.coo.expireToUTCString+'; path=/'
  
  if(APP.coo.exists)
  {
    APP.coo.delete
    'coo.exists'.should.be.false
  }
}


function Cookie_Create___ComplexProperty_test() {
  APP.coo = cookie('uncookie_created')
  APP.coo._expire = 1
  APP.coo._value  = "Ça c'est la \"valeur\" du cookie d'été"
  APP.coo.create // <-- TEST
  var expDate = new Date(NOW)
  // --- Vérification ---
  delete APP.coo
  APP.cookiechecked = cookie("uncookie_created")
  'cookiechecked.exists'.should.be.true
  'cookiechecked'.should.exist // En utilisant les méthodes du cookie
  'cookiechecked.value'.should = "Ça c'est la \"valeur\" du cookie d'été"
  w('NOTE: On ne peut pas récupérer la date d’expiration d’un cookie')
  'cookiechecked.expireDate.getTime()'.should.be.between(expDate.getTime(), expDate.getTime()+2000)
}
function Cookie_Fonction_Cookie_creant_instance() {
  
  function FausseClasse(){}
  APP.coo = cookie("mon_cookie")
  'coo'.should_not.be.an_instanceof(FausseClasse)
  'coo'.should.be.an_instanceof(_Cookie)
}

// Test de la pseudo-méthode expireToUTCString qui retourne la date
// d'expiration au format UTC (format pour le cookie)
function Cookie_expireToUTCString___Property_test() {
  APP.coo = cookie('uncookie')
  APP.coo._expire = 1
  var exp = NOW + (1).day
  'coo.expireToUTCString'.should = (new Date(exp)).toUTCString()
}

function Cookie_Fonctionnement_methodes_generales___test() {
  
  // name
  blue("name doit renvoyer le nom ou null")
  APP.coo = cookie("Un nouveau cookie")
  'coo.name'.should = "Un nouveau cookie"
  APP.coo = cookie()
  'coo.name'.should.be.null
  
  // create + delete
  blue("create/delete (test superficiel — cf. l'autre plus consistant) doivent créer et détruire le cookie")
  APP.coo.value = "Une valeur pour voir"
  APP.coo.expire_in( (4).days )
  'coo.exists'.should.be.false
  APP.coo.create
  'coo.exists'.should.be.true
  APP.coo.delete
  'coo.exists'.should.be.false
  
  // value
  blue("value doit retourner la value ou permettre de la définir")
  APP.coo = cookie("new cookie")
  'coo.value'.should.be.null
  APP.coo._value = "Une valeur"
  'coo.value'.should = "Une valeur"
  APP.coo.value = "Une autre valeur"
  'coo.value'.should = "Une autre valeur"
  // Valeur plus complexe
  APP.coo.value = {un:"tableau", asso:"ciatif"}
  'coo.value'.should = '{"un":"tableau","asso":"ciatif"}'
  
  // get_value
  blue("get_value doit récupérer la valeur du cookie et la renvoyer, mais pas la mettre dans _value")
  var val = "La valeur du cookie saved at " + Time.now()
  APP.coo = cookie("moncookiesaved", val)
  APP.coo._expire = 2
  APP.coo.create
  delete APP.coo
  APP.acoo = cookie("moncookiesaved")
  'acoo.get_value'.should = val
  'acoo._value'.should.be.null
  // On essaie que `value' remonte bien la donnée
  'acoo.value'.should = val
  'acoo._value'.should = val
  
  // expire_in
  blue("expire_in")
  specs("Doit permettre de définir dans combien de temps le cookie expirera. La valeur "+
        "transmise peut être un nombre inférieur à 1000 (=> nombre de jours) ou supérieur à "+
        "1000 (=> nombre de millisecondes)")
  APP.acoo.expire_in(4)
  var dans4jours = NOW + (4).days
  'acoo._expire'.should = 4
  'acoo.expireDate.getTime()'.should.be.between(dans4jours - 1000, dans4jours + 1000)
  
  APP.acoo.expire_in( (1).day )
  var dans1jours = NOW + (1).day
  'acoo._expire'.should = 24 * 60 * 60 * 1000
  'acoo.expireDate.getTime()'.should.be.between(dans1jours - 1000, dans1jours + 1000)
  
  //expire_at
  blue("expire_at")
  specs("Doit permettre de définir la date précise d'expiration du cookie.")
  APP.acoo.expire_at([2014, 1, 1])
  'acoo._expire'.should = [2014, 0, 1, 0, 0, 0]
  var exp = (new Date(2014, 0, 1)).getTime()
  'acoo.expireDate.getTime()'.should.be.between(exp - 1000, exp + 1000)
  
  'acoo.expire_at(12)'.should.throw("Il faut spécifier la data d'expiration (avec `expire_at') avec un [année, mois, jour, heure, minute, secondes]")
  
  if(APP.acoo.exists)
  {
    APP.acoo.delete
    'acoo.exists'.should.be.false
  }
}
function Cookie_ExpireDate___ComplexProperty_test() {
  specs("La méthode expireDate doit retourner dans tous les cas, même lorsqu'aucune date "+
  "d'expiration n'est précisée, la date d'expiration définie pour le cookie.")
  
  w("Dans date d'expiration précisée")
  APP.coo = cookie('uncookie')
  'coo.expireDate'.should_not.be.null
  'coo.expireDate'.should.be.an_instanceof(Date)
  'coo.expireDate.getTime()'.should.be.between(NOW - 2000, NOW + 2000)
  
  w("Avec une date d'expiration précisée par un nombre (de jours)")
  var exp = NOW + (1).day
  APP.coo._expire = 1
  'coo.expireDate'.should_not.be.null
  'coo.expireDate.getTime()'.should.be.between(exp, exp + 2000)
 
  w("Avec une date d'expiration précisée explicitement (array)")
  APP.coo._expire = [2051, 0, 2]
  var cinquante_ans = new Date(2051, 0, 2)
  'coo.expireDate'.should_not.be.null
  'coo.expireDate'.should = cinquante_ans
  
}

function Cookie_Test_methodes_test___test() {
  specs("Les méthodes de test se contentent de savoir si un cookie existe et s'il a une "+
  "certaine valeur.")
  
  APP.coo = cookie("un"+Time.now()+"incroyable_cookie")
  'coo'.should_not.exist
  APP.coo.value = "Une valeur"
  APP.coo.expire_in(4)
  APP.coo.create
  APP.coo.should.exist
  APP.coo.should_not  = "Une autre valeur"
  APP.coo.should      = "Une valeur"
  
  
  if(APP.coo.exists) APP.coo.delete
  
}