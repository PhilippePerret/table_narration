/**
  * @module edition.collection.js
  * @main Collection
  * @class Collection
  */

window.Collection = window.Collection || {}

$.extend(Collection,{
})

/* ---------------------------------------------------------------------

     PROPRIÉTÉS COMPLEXES

 ---------------------------------------------------------------------*/
Object.defineProperties(Collection,{
  /**
    * Destruction de la collection courante
    * Notes
    * -----
    *   * Par mesure de prudence, il n'est possible de détruire que la collection
    *     test, pas la "current".
    *   * L'application est rechargée en fin de processus pour tout ré-initialiser.
    *
    * @method destroy
    * 
    */
  "destroy":{
    get:function(){
      if(!MODE_TEST) return F.error("On ne peut détruire la collection qu'en mode test.")
      Ajax.send({script:'collection/destroy',collection:'test'},
      $.proxy(this.after_destroy, this))
    }
  },
  "after_destroy":{
    value:function(rajax){
      if(rajax.ok)
      {
        // On attend une seconde avant de recharger
        setTimeout(function(){location.reload()}, 1000)
      }
      else F.error(rajax.message)
    }
  }
})