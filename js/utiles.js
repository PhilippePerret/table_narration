/*
 *  Affiche un message d'aide (par exemple les raccourcis clavier)
 *  
 */
window.help = function(message)
{
  $('div#div_help').html( message )
}

/*
 *  Retourne le code HTML pour afficher l'image de path +path+
 *
 *  Pour le moment, l'image doit se trouver dans le dossier lib/img
 *  
 */
window.image = function(path, attrs)
{
  var real_path = '../lib/img/' + path
  var tag = '<img src="'+real_path+'"'
  if(undefined != attrs)
  {
    arr_attrs = []
    for(var attr in attrs)
    {
      if(false == attrs.hasOwnProperty(attr)) continue;
      arr_attrs.push(attr + '="' + attrs[attr] + '"')
    }
    if(arr_attrs.length) tag += ' ' + arr_attrs.join(' ')
  }
  tag += ' />'
  return tag
}