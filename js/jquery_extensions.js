$.fn.extend({
  /*
   *  Pour définir la valeur d'un élément quelque soit sont type
   *  que ce soit un champ d'édition (changement de `value') ou un
   *  contenant statique (chamgement de son innerHTML)
   *  
   */
  set:function(value){
    if( this.length == 0 ) return
    var tag = this[0].tagName ;
    var is_champ_edition = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tag) > -1 ;
    return this.each(function(is_champ_edition){
      this[is_champ_edition?'value':'innerHTML'] = value
    })
  },
})