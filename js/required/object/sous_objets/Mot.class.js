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

  ObjetClass.call(this, id)
  this.OBJS         = DICO
  this.folder_ajax  = 'scenodico'
  this.class_min    = 'dico'
  
  /* État */
  this.loaded = false
  
  this.OBJS.list[id] = this
}
Mot.prototype = Object.create( ObjetClass.prototype )
Mot.prototype.constructor = Mot


/*
 *  Méthodes complexe
 *  
 */ 
Object.defineProperties(Mot.prototype,{
 
  /* ---------------------------------------------------------------------
   *
   *  DATA
   *  
   --------------------------------------------------------------------- */
  "mot":{
    enumerable:true,
    get:function(){return this._mot},
    set:function(val){
      this._mot = val
    }
  },
  "definition":{
    enumerable:true,
    get:function(){ return this._definition},
    set:function(def){
      this._definition = def
    }
  },
  
  /*
   *  Retourne les "data mini", c'est-à-dire les données qu'on trouve
   *  dans FILMS.DATA (mais ici, l'objet est construit)
   *
   *  NOTES
   *  -----
   *    = Cette méthode n'est utile (pour le moment) qu'à la création
   *      d'un nouveau film.
   *  
   */
  "data_mini":{
    get:function(){
      return {
        id          : this.id, 
        mot         : this.mot,
        let         : this.let
      }
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  MÉTHODES D'AFFICHAGE
   *  
   --------------------------------------------------------------------- */
  
})