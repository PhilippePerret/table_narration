/*
 *  Retourne le code HTML pour afficher l'image de path +path+
 *
 *  Pour le moment, l'image doit se trouver dans le dossier lib/img
 *  
 */
window.image = function(path, options)
{
  var real_path = '../lib/img/' + path ;
  return '<img src="'+real_path+'" />' ;
}