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

  ObjetClass.call(this, fid)
  this.OBJS         = FILMS
  this.folder_ajax  = 'film'
  this.class_min    = 'film'
  
  /* État */
  this.loaded = false
  
  this.OBJS.list[fid] = this
}
Film.prototype = Object.create( ObjetClass.prototype )
Film.prototype.constructor = Film

