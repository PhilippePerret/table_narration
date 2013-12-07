/*
 *  Pour faire des tests
 *
 */
function bricole_event(data_injected) {
  var data = {
    type:null, bubble:true, ctrl:false, alt:false, shift:false, meta:false,
    keyCode:null, charCode:null, which:null
  }
  for(var prop in data_injected) data[prop] = data_injected[prop]

  console.log("data finales:");
  console.dir(data)
  
  e = document.createEvent("KeyboardEvent");
  e.initKeyEvent(
      data.type, 
      data.bubble, 
      true /* cancellable*/, 
      window  /* view */, 
      data.ctrl, data.alt, data.shift, data.meta,
      data.keyCode, data.charCode)
  return e
}
var obj, e ;
function hit()
{
    console.log("-> hit !");
    window.focus()
    obj[0].focus()
    obj.select()
    // window.dispatchEvent(e)
    // lettre = [80, 104,105,108]
    lettre = [80]
    for(var i in lettre)
    {
      var ccode = lettre[i];
      var ev = bricole_event({
        type:'keypress', 
        charCode:ccode, 
        keyCode:0,
        isChar:true,
        isTrusted:true
      })
      obj[0].dispatchEvent(ev)
      // $(obj).trigger(ev)
      // e = $.Event("keypress", {charCode:lettre[i], which:lettre[i]});
      // // $(window).trigger(e);
      // $(obj).trigger(e);
      // e = $.Event("keyup", {keyCode:i, which:i});
      // // $(window).trigger(e);
      // $(obj).trigger(e);
    }
    
    e = $.Event("keypress", {keyCode:13});
    $(obj).trigger(e);
    
    console.log("Valeur dans champ : '" + obj.val() + "'")
}
function install_button_test()
{
    $('div#buttons_right').append(
        '<input type="button" value="Try press key" onclick="try_press_key()" />'
      )
}
function try_press_key()
{
  console.clear();
  
  // obj = document.getElementById('f-0-titre') ;
  $('section#table').append(
    '<input id="presskey" type="text" value="" style="witdth:10em;" />'
  )
  obj = $('input#presskey')
  

  if (obj){
      console.log("Obj est défini")
      $(obj).select();
      //obj.dispatchEvent(e)
      }

  setTimeout("hit()", 1000)
}
