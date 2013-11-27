/*
 *  SAND BOX
 *
 *  Mettez du code à tester ici et cliquer sur la case à cocher `Sand box' (ou `Bac à sable')
 *
 *  Ce bac à sable permet d'essayer du code sans avoir à recharger l'application. Il est
 *  actualiser à chaque fois.
 *
 */

/* === CLASSE BOOK === */
window.Book = function(data)
{
  if(undefined == data) data = {}
  data.type = 'book'
  Fiche.call(this, data)
}
Book.prototype = Object.create( Fiche.prototype )
Book.prototype.constructor = Book

/* === CLASSE CHAPTER === */
window.Chapter = function(data)
{
  if(undefined == data) data = {}
  data.type = 'chap'
  Fiche.call(this, data)
}
Chapter.prototype = Object.create( Fiche.prototype )
Chapter.prototype.constructor = Chapter


/* === PROPRIÉTÉ DE FICHE === */
Object.defineProperties(Fiche.prototype, {
  
  /*
   *  Définit si nécessaire l'objet jQuery de la fiche et le retourne
   *  
   */
  "obj":{
    configurable:true,
    get:function(){
      if(undefined == this._obj) this._obj = $('fiche#'+this.id)
      return this._obj
    }
  },
  
  /* Retourne le DOM élément de la fiche */
  "dom_obj":{
    configurable:true,
    get:function(){
      if(undefined == this._dom_obj) this._dom_obj = this.obj[0]
      return this._dom_obj
    }
  },
  
  /*
   *  Récupérer ou définir la position TOP de la fiche.
   *  La définir correspond à définir la propriété _top et à placer la fiche au bon
   *  endroit.
   *
   */
  "top":{
    configurable:true,
    get:function(){ return this._top },
    set:function(new_top) {
      this._top = new_top
      this.positionne
    }
  },
  
  /*
   *  Récupérer ou définir la position LEFT de la fiche.
   *  La définir correspond à définir la propriété _top et à placer la fiche au bon
   *  endroit.
   *
   */
  "left":{
    configurable:true,
    get:function(){ return this._left },
    set:function(new_left) {
      this._left = new_left
      this.positionne
    }
  },
  
  /*
   *  Positionne la fiche sur le table en fonction de :
   *    - son état ranged ou non
   *    - ses top / left
   */
  "positionne":{
    configurable:true,
    get:function(){
      if(this.ranged) return
      this.obj.css({'top':this.top+"px", 'left':this.left+"px"})
    }
  }
})



// KEEP THIS CODE LINE !
TEST_SANDBOX_READY = true