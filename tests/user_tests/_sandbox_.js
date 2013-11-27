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