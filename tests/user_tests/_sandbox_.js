/*
 *  SAND BOX
 *
 *  Mettez du code à tester ici et cliquer sur la case à cocher `Sand box' (ou `Bac à sable')
 *
 *  Ce bac à sable permet d'essayer du code sans avoir à recharger l'application. Il est
 *  actualiser à chaque fois.
 *
 */

Object.defineProperties(Fiche.prototype, {
  
  "enfants":{
    get:function(){ return this._enfants },
    set:function(children){ this._enfants = children },
    configurable:true
  },
  
  "parent":{
    get:function(){ return this._parent },
    set:function(pere)
    {
      if('object' != typeof pere) throw LOCALE.fiche.error['parent should be an object']
      if(pere.class != "Fiche")   throw LOCALE.fiche.error['parent should be a fiche']
      // Le père est-il du bon type ?
      
      this._parent = pere
      return this
    },
    configurable:true
  }
  
})

Fiche.prototype.add_enfant = function(enfant)
{
  
}

// KEEP THIS CODE LINE !
TEST_SANDBOX_READY = true