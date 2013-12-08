$(document).ready(function(){

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
  
  // Lancer (ou non) la boucle de sauvegarde
  Collection.enable_automatic_saving($('input#cb_automatic_save')[0].checked)
  

});