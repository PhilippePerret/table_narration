DB_SIMPLE     = 1
DB_MAIN_STEPS = 2
DB_CURRENT    = 4
DB_FCT_ENTER  = 8

/*
 *  Niveau de débuggage de l'application
 *  
 */
var DL;
if(console)
{
  DL = DB_SIMPLE | DB_CURRENT 
       | DB_FCT_ENTER           // Pour voir les entrées dans les méthodes
}
else
{
  DL = null
}

/*
 *  Méthode pour écrire le débug
 *  C'est la méthode à appeler avec le message et le niveau
 *  
 */
window.dlog = function( message, debug_level )
{
  if(undefined == debug_level) debug_level = DB_SIMPLE
  if( DL & debug_level)
  {
    if('string'==typeof message) console.log(message)
    else if('object'== exact_typeof(message)) console.dir(message)
    else console.log(message) // Array
  }
}