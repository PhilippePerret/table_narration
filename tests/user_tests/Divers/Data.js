/*
 * To run this test : Divers/Data
 */
function Divers_Data()
{
  my = Divers_Data
  
  my.step_list = [
  "Existence des propriétés et méthodes",
  "Test de la méthode `dispatch`",
  "Test de la méthode `exact_typeof`",
  "Test de la méthode `exact_val_of_string`"
  ]

  switch(my.step)
  {
  case "Existence des propriétés et méthodes":
    Data_Existence_properties_and_methods()
    break
  
  case "Test de la méthode `dispatch`":
    Data_Test_method_dispatch()
    break
    
  case "Test de la méthode `exact_typeof`":
    Data_Test_method_exact_typeof()
    break
    
  case "Test de la méthode `exact_val_of_string`":
    Data_Test_method_exact_val_of_string()
    break
    
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function Data_Existence_properties_and_methods() {
  var props = []
  L(props).each(function(prop){ 'Data'.should.have.property(prop)})
  
  var methods = ['dispatch', 'exact_typeof']
  L(methods).each(function(meth){ 'Data'.should.respond_to(meth) })
}

function Data_Test_method_dispatch() {
  if('Data'.is.undefined) return failure("Data doit exister pour pouvoir tester la méthode `dispatch`.")
  
  w("Affectation simple d'une propriété à un objet")
  APP.testedobj = {}
  'testedobj.une_prop'.should.be.undefined
  APP.Data.dispatch(APP.testedobj, {une_prop:12}) // <-- TEST
  'testedobj.une_prop'.should.be.defined
  'testedobj.une_prop'.should = 12
  
  blue("Correction des propriétés spéciales")
  APP.Data.dispatch(APP.testedobj, {id:"123"}) // <-- TEST
  'testedobj.id'.should_not.be.a_string
  'testedobj.id'.should.be.a_number
  'testedobj.id'.should.be.equal_to(123, strict = true)
}

function Data_Test_method_exact_val_of_string()
{
  'Data.exact_val_of_string("un string")' .should = "un string"
  'Data.exact_val_of_string("true")'      .should = true
  'Data.exact_val_of_string("false")'     .should = false
  'Data.exact_val_of_string("null")'      .should = null
}
function Data_Test_method_exact_typeof() {
  'Data.exact_typeof(12)'           .should = 'integer'
  'Data.exact_typeof(12.1)'         .should = 'float'
  'Data.exact_typeof(true)'         .should = 'boolean'
  'Data.exact_typeof(null)'         .should = 'null'
  'Data.exact_typeof(undefined)'    .should = 'undefined'
  'Data.exact_typeof("un string")'  .should = 'string'
  'Data.exact_typeof({})'           .should = 'object'
  'Data.exact_typeof([])'           .should = 'array'
  'Data.exact_typeof(/(a|b)/)'      .should = 'regexp'
  'Data.exact_typeof(function(){})' .should = 'function'
  'Data.exact_typeof(2 * "a")'      .should = 'nan'
  'Data.exact_typeof(2/0)'          .should = 'infinity'
}