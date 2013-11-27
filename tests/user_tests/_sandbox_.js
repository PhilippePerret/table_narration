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
      try
      {
        if('object' != typeof pere) throw 'parent should be an object';
        if(pere.class != "Fiche")   throw 'parent should be a fiche';
        thislevel = FICHES.datatype[this.type].level ;
        perelevel = FICHES.datatype[pere.type].level ;
        if( thislevel >= perelevel ) throw 'parent bad type';
      }
      catch(err)
      { 
        throw LOCALE.fiche.error[err]
      }
      
      this._parent = pere
    },
    configurable:true
  }
  
})

Fiche.prototype.add_enfant = function(enfant)
{
  
}

Fiche.prototype.dispatch = function(data)
{
  for(var prop in data)
  {
    if(false == data.hasOwnProperty(prop)) continue;
    this[prop] = data[prop]
  }
}

// KEEP THIS CODE LINE !
TEST_SANDBOX_READY = true