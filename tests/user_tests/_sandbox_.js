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
      if(undefined == this._obj){
        var obj = $('fiche#'+this.id)
        obj.length && (this._obj = obj)
      } 
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
      if( this.ranged || this.top == null || !this.obj ) return
      this.obj.css({'top':this.top+"px", 'left':this.left+"px"})
    }
  },
  
  /*
   *  Création d'une nouvelle fiche
   *  
   *  “Créer la fiche” consiste à :
   *    - mettre la fiche en attente de sauvegarde
   *    - créer son objet sur la table
   */
  "create":{
    configurable:true,
    get:function(){
      this.modified = true
      this.build
      return true
    }
  },
  
  /*
   *  Construction de la fiche sur la table
   *  
   */
  "build":{
    configurable:true,
    get:function(){
      // On ajoute le code ou on le remplace
      if(this.obj) this.obj.replaceWith( this.html )
      else         $('section#table').append( this.html )
      // On positionne la fiche
      this.positionne
      // On doit la rendre draggable
      this.obj.draggable({containment:'parent'})
      return true
    }
  },
  
  /*
   *  Retourne le code HTML pour la fiche
   *  
   */
  "html":{
    configurable:true,
    get:function(){
      return  '<fiche id="' + this.id + '" class="fiche '+this.type+'">' +
              '<div class="poignee"></div>' +
              this.html_recto + this.html_verso +
              '</fiche>' ;
    }
  },
  
  /*
   *  Retourne le code HTML du RECTO de la fiche
   *  
   */
  "html_recto":{
    configurable:true,
    get:function(){
      return  '<recto id="recto-'+this.id+'" class="'+this.type+'">'+
              '</recto>'
    }
  },
  
  /*
   *  Retourne le code HTML du VERSO de la fiche
   *  
   */
  "html_verso":{
    configurable:true,
    get:function(){
      return  '<verso id="verso-'+this.id+'" class="'+this.type+'">'+
              '</verso>'
    }
  },
  
  /*
   *  Sauvegarde de la fiche
   *  
   */
  "save":{
    configurable:true,
    get:function(){
      return true
    }
  }
})



// KEEP THIS CODE LINE !
TEST_SANDBOX_READY = true