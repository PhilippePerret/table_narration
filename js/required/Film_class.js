/*
 *  Class Film
 *  ----------
 *  Pour la gestion d'un film, principalement lorsqu'il est édité
 *
 *  NOTES
 *  -----
 *    ::  C'est juste la première définition, car l'objet FILMS en aura
 *        besoin à sa création
 */

window.Film = function(fid)
{
  // L'identifiant est toujours requis
  if(undefined == fid || fid == null || fid == "") throw LOCALE.film.error['no id supplied']

  this.OBJS         = FILMS
  this.folder_ajax  = 'film'
  this.class_min    = 'film'
  this.id           = fid
  
  /* État */
  this.loaded = false
  
  this.OBJS.list[fid] = this
}
