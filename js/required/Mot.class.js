/*
 *  Class Mot
 *  ----------
 *  Pour la gestion d'un mot du scénodico
 *
 *  NOTES
 *  -----
 *    ::  C'est juste la première définition, car l'objet DICO en aura
 *        besoin à sa création
 */

window.Mot = function(id)
{
  // L'identifiant est toujours requis
  if(undefined == id || id == null || id == "") throw LOCALE.film.error['no id supplied']

  this.OBJS         = DICO
  this.folder_ajax  = 'scenodico'
  this.class_min    = 'dico'
  this.id           = id
  
  /* État */
  this.loaded = false
  
  this.OBJS.list[id] = this
}
