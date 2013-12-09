$.fn.extend({
  /*
   *  Pour définir la valeur d'un élément quelque soit sont type
   *  que ce soit un champ d'édition (changement de `value') ou un
   *  contenant statique (chamgement de son innerHTML)
   *  
   */
  set:function(value){
    if( this.length == 0 ) return
    return this.each(function(){
      var edition = ('.INPUT.TEXTAREA.SELECT.'.indexOf('.'+this.tagName+'.') > -1) ;
      this[edition?'value':'innerHTML'] = value
    })
  },
})