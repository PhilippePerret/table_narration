/* === CLASSE BOOK === */
window.Book = function(data)
{
  if(undefined == data) data = {}
  data.type = 'book'
  Fiche.call(this, data)
}
Book.prototype = Object.create( Fiche.prototype )
Book.prototype.constructor = Book

Object.defineProperties(Book.prototype,{
  
  /*
   *  Concernant le TITRE RÉEL (real_titre)
   *  
   */
  "real_titre_jid":{get:function(){return 'input#'+this.dom_id+'-real_titre'}},
  "input_real_titre":{get:function(){ return $(this.real_titre_jid) }},
  "real_titre":{
    set:function(titre){ 
      if (titre == this._real_titre) return
      this._real_titre = titre
      this.input_real_titre.val( titre )
      this.modified = true
    },
    get:function(){
      return this._real_titre || null
    }
  }
  
})

/* Méthode appelée au changement de real titre du livre */
Book.prototype.onchange_real_titre = function(evt)
{
  this.real_titre = this.input_real_titre.val()
}