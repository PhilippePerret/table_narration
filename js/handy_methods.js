/*
 *  Méthodes pratiques
 *  ------------------
 *
 *    {Film}    get_film(<id film>)
 *    {Mot}     get_mot(<id mot>)
 *    (void)    help(<message pour footer help>)
 *    {String}  image(<path in ../lib/img/>)
 *  
 */
/*
 *  Retourne l'instance {Mot} du mot d'identifiant +mid+
 *  en la créant si nécessaire
 *
 *  NOTES
 *  -----
 *    = C'est un raccourci de la méthode DICO.get
 *  
 */
window.get_mot = function(mid)
{
  return DICO.get(mid)
}
/*
 *  Retourne l'instance {Film} du film d'identifiant +fid+
 *  en la créant si nécessaire.
 *
 *  NOTES
 *  -----
 *    = Cette méthode est un raccourci de `FILMS.get(id)'
 *  
 */
window.get_film = function(fid)
{
  return FILMS.get(fid)
}

/*
 *  Retourne l'instance {Ref} de la référence d'identifiant +rid+
 *  en la créant si nécessaire.
 *
 *  NOTES
 *  -----
 *    = Cette méthode est un raccourci de `REFS.get(rid)'
 *  
 */
window.get_ref = function(rid)
{
  return REFS.get(rid)
}

/*
 *  Affiche un message d'aide (par exemple les raccourcis clavier)
 *  dans la barre inférieure.
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