/*
 *  Script de test `sandbox.js'
 *
 *  To run it, copy and past in Pure-JS-Test : test_sandbox
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function test_sandbox(){

  my = sandbox
  
  my.specs =  "Test superficiel de la sandbox." +
              "\nPour pouvoir fonctionner, il faut mettre dans la sandbox le code :"+
              "\n// ********* CODE **************"+
              "\n`MonObjet = {`"+
              "\n\t`uneMethode:function(){`"+
              "\n\t\treturn true"+
              "\n\t`}`"+
              "\n`}`"+
              "\nTEST_SANDBOX_READY = true"+
              "\n// ********* / CODE **************"
      
  my.step_list = [
    "Vérification que la sandbox soit prête pour ce test",
    "La sandbox doit se trouver dans le document",
    "Les codes de la sandbox doivent être pris en compte dans l'application"
    ]

  switch(my.step){
  case "Vérification que la sandbox soit prête pour ce test":
    

    switch(my.stop_point)
    {
    case 1:
      // La case "Sandbox" doit être cochée
      if($('input#cb_sandbox')[0].checked == false)
      {
        failure("Il faut cocher la case à cocher “Sandbox” pour tester la sandbox.")
        my.force_end // on finit
      }
      my.wait.for(0)._(NEXT_POINT)
      break
    case 2:
      // Le fichier sandbox doit exister
      my.sandbox = file('./tests/user_tests/_sandbox_.js')
      my.sandbox.should.exist.and({
        step_on_failure :my.last_step,
        stop_point      :NEXT_POINT
      })
      break
    case 3:
      my.sandbox.load.and( NEXT_POINT )      
      break
      
    case 4:
      if(
        my.sandbox.content.indexOf('\nMonObjet') < 0 ||
        my.sandbox.content.indexOf('uneMethode') < 0
      )
      {
        failure("Le code de la sandbox n'est pas préparé pour ce test (lire les specs plus haut)")
        my.abort
      }
      my.wait.for(0)
      break
    }
    break
  case "La sandbox doit se trouver dans le document":
    var existe = false
    jq('script#script_sandbox').should.exist
    break
  case "Les codes de la sandbox doivent être pris en compte dans l'application":
    'MonObjet'.should.be.defined
    'MonObjet'.should.respond_to('uneMethode')
    'MonObjet.uneMethode'.should.return(true)
    break
    
    
  default:
    pending("Test '"+my.step+"' is pending.")
  } // /switch

}
