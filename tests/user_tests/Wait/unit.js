/*  
 *  Tests unitaires de Wait
 *
 *  Pour le jouer : pure_js_tests/Wait/unit
 *
 */
function pure_js_tests_Wait_unit() {
  I = pure_js_tests_Wait_unit
  
  if(I.dont_know_step_list){
    
    specs("Test unitaire de l'objet Wait.")
    
    I.set_step_list_to([
      "Test du traitement des options envoyées"
      ])
  }
  
  I.define_work
  
  if(I.run_step(
    
    
    "Test du traitement des options envoyées"
  
  
  )){
    function pourvoir(){return false}
    var list_test = [
      [12, {next_stop_point:12}],
      ["Un message à afficher", {message:"Un message à afficher"}],
      [pourvoir, {suivre: pourvoir}],
      [
        {next_stop_point:24, message_failure:"Un message d'échec"}, 
        {next_stop_point:24, message_failure:"Un message d'échec", message:"Un message avant"},
        {message:"Un message avant"}]
    ]
    L(list_test).each(function(duo){
      if(undefined == duo[2]) delete Wait.options
      else Wait.options = duo[2]
      Wait.traite_options( duo[0] )
      APP.opts = Wait.options
      'opts'.should.be =  duo[1]
    })
    
    
    
    I.end_step
  }
}