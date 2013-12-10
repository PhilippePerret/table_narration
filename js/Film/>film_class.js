/*
 *  Class Film
 *  ----------
 *  Pour la gestion d'un film, principalement lorsqu'il est édité
 *
 *  NOTES
 *  -----
 *    ::  On instancie toujours un film seulement avec son identifiant  
 */

window.Film = function(fid)
{
  this.id = fid
  
  /* État */
  this.loaded = false
  
  FILMS.list[fid] = this
}

Film.prototype.dispatch = function(data)
{
  var film = this
  for(var prop in data) film[prop] = data[prop]
}

Object.defineProperties(Film.prototype,{
  
  /* ---------------------------------------------------------------------
   *
   *  DATA
   *  
   --------------------------------------------------------------------- */
  
  "titre":{
    get:function(){return this._titre},
    set:function(titre){
      this._titre = titre
    }
  },
  "titre_fr":{
    get:function(){return this._titre_fr},
    set:function(titre){
      this._titre_fr = titre
    }
  },
  "annee":{
    get:function(){return this._annee},
    set:function(annee){
      this._annee = parseInt(annee, 10)
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  ETAT
   *  
   --------------------------------------------------------------------- */
  "modified":{
    get:function(){ return this._modified || false },
    set:function(val){
      this._modified = val
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  PSEUDO-MÉTHODES
   *  
   --------------------------------------------------------------------- */
  
  /*
   *  Chargement des données complètes du film
   *  
   *  @param  poursuivre  La méthode poursuivre
   */
  "load":{
    value:function(poursuivre, rajax){
      if(undefined == rajax)
      { // => Requête ajax
        Ajax.send(
          {script:'film/load', film_id:this.id},
          $.proxy(this.load, this, poursuivre)
        )
      }
      else
      { // => Retour chargement
        if(rajax.ok)
        {
          this.dispatch( rajax.film )
          this.loaded = true
          if('function'==typeof poursuivre) poursuivre()
        }
        else F.error(rajax.message)
      }
    }
  },
  
  /*
   *  Enregistrement des données complètes du film
   *  
   *  @param  poursuivre  La méthode poursuivre
   */
  "save":{
    value:function(poursuivre, rajax){
      if(undefined == rajax)
      { // => Requête ajax
        Ajax.send(
          {script:'film/save', film_data:this.data_for_save},
          $.proxy(this.save, this, poursuivre)
        )
      }
      else
      { // => Retour sauvegarde
        if(rajax.ok)
        {
          this.modified = false
          if('function'==typeof poursuivre) poursuivre()
        }
        else F.error(rajax.message)
      }
    }
  },
  
  /*
   *  Mise en édition du film
   *  -----------------------
   *
   *  NOTES
   *  -----
   *    = La méthode s'assure que les data complètes soient chargées
   *
   */
  "edit":{
    get:function(){
      if(false == this.loaded) return this.load($.proxy(this.edit, this))
      FILM.Edition.set_values( this )
    }
  },
  
  
})