$(document).ready(function(){

  // On charge la collection
  // @note: Cela lancera aussi la fabrication du backup quotidien
  Collection.load
  
  // Lancer la boucle de sauvegarde
  Collection.start_automatic_saving

});