/**
  * @module ready.js
  */

$(document).ready(function(){

  ContextualHelp.init()
  /*
   *  Chargement de la collection
   *  ---------------------------
   *
   *  NOTES
   *  -----
   *  * En mode normal, cela lancera aussi la fabrication du backup quotidien
   *  * Après le chargement, on prépare l'interface (au besoin)
   *  * À la fin du chargement, on met en route la sauvegarde automatique
   *
   */
  Collection.load
  
  CHelp.adapt
  
});