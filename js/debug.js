/**
  * @module Debug
  */

DB_SIMPLE       = 1
DB_MAIN_STEPS   = 2
DB_CURRENT      = 4
DB_FCT_ENTER    = 8
DB_INFOS_EVENT  = 16
// 32
// 64
// 128
DB_DETAILLED  = 256

/*
 *  Niveau de débuggage de l'application
 *  
 *  Le niveau de débuggage peut être modifié localement en
 *  redéfinissant `DL' puis en le remettant à CURRENT_DL :
 *    DL = DB_SIMPLE | DB_DETAILLED
 *    ...
 *    DL = CURRENT_DL
 */
var DL;
if(console)
{
  DL = DB_SIMPLE | DB_CURRENT 
       // | DB_FCT_ENTER            // Pour voir les entrées dans les méthodes
       // | DB_DETAILLED            // Pour les moindres détails
       // | DB_INFOS_EVENT          // Pour les infos sur les évènements
  
  CURRENT_DL = 0 + DL
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