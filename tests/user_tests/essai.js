/*
 * To run this test : essai
 */
function essai()
{
  my = essai
  
  my.before_all = function(){
    reload_app()
  }
  my.specs = "Différents tests"
  
  my.step_list = [
  ["Test de Keyboard",Test_Keyboard],
  "Fin"
  ]

  switch(my.step)
  {
  case "Fin":
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function Test_Keyboard() {
  switch(my.stop_point)
  {
  case 1:
    blue("Active l'application pour suivre les opérations.")
    my.book = APP.FICHES.list[0]
    // my.page = APP.ipage = create_page({titre:"Son titre"})
    jq(my.book.input_titre_jid).should.exist
    'FICHES.list[0].selected'.should.be.false
    // Ne fonctionne pas :
    // Mouse.press_and_drag(my.book.obj, {for_x:100, for_y:100})
    // Ne fonctionne pas :
    // Mouse.click(my.book.obj)
    // APP.window.focus()
    my.wait.for(4).and(NEXT_POINT)
    break
  case 2:
    APP.F.show("J'essaie avec Mouse.click")
    Mouse.click(my.book.obj)
    my.wait.for(1).and(NEXT_POINT)
    break
  case 3:
    'FICHES.list[0].selected'.should.be.true
    APP.F.show("J'essaie avec jQuery.click()")
    // Keyboard.press({key_code:K_ERASE})
    // Keyboard.press(Key_o)
    // Fonctionne : 
    with(APP){FICHES.get(0).obj.click()}
    my.wait.for(1).and(NEXT_POINT)
    break
  case 4:
    'FICHES.list[0].selected'.should.be.true
    // APP.F.show("Le champ de texte devrait être vidé")
    my.wait.for(1).and(NEXT_POINT)
    break
  case 5:
    APP.F.show("J'ESSAIE DE CLIQUER UNE TOUCHE AVEC JQUERY")
    var book = APP.FICHES.get(0)
    // var e = jQuery.Event( "keydown", { keyCode: Key_o } );
    with(APP)
    {
      var e = $.Event( "keydown", { charCode: Key_o } );
      $('input#f-0-titre').select();
      $('input#f-0-titre').trigger( e );
    }
    my.wait.for(2).and(NEXT_POINT)
    break
  case 6:
    APP.F.show("LE TITRE DOIT ÊTRE o")
    my.wait.for(0)
    break
    
  }
  
}