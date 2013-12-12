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
  // L'identifiant est toujours requis
  if(undefined == fid || fid == null || fid == "") throw LOCALE.film.error['no id supplied']

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

$.extend(Film.prototype,{
  
  /*
   *  Construit et retourne la balise à insérer dans une fiche
   *  avec les options +options+
   *
   *  @param  options   {Hash} des options.
   *                    Ces options sont celles disponibles dans FILM.OPTIONS et
   *                    sont insérées si elles existent en 3e paramètre de la
   *                    balise. Elles permettront de composer le titre affiché
   *  
   */
  balise:function(options)
  {
    if(undefined == options) options = {}
    var bal = "[film:"+this.id+"|"
    if(options.titrefr === false) bal += this.titre
    else bal += (this.titre_fr || this.titre)
    // Les options choisies
    var opts = L(options).select(function(opt, value){ return value == true }).join(' ')
    if(opts != "") bal += "|" + opts
    bal += "]"
    return bal
  },
  
  /*
   *  Formate la balise film (cf. `balise' ci-dessus) en respectant
   *  les options +options+
   *  
   *  @param  opts          {Array} Les options d'affichage du titre du film.
   *                        Cf. ci-dessus
   *  @param  skip_missing  Si TRUE, on passe les données manquantes qui nécessiteraient
   *                        le chargement complet du film. Cela est utile lorsqu'on
   *                        passe en revue toutes les balises pour les formater, comme
   *                        après l'édition d'un champ de saisie.
   *                        Cependant, ces films sont mis en attente et chargés dès
   *                        que possible (cf. FILMS.need_loading)  
   */
  formate:function(opts, skip_loading)
  {
    if(undefined == opts) opts = []
    else if ('string' == typeof opts) opts = opts.split(' ')
    // Il faut passer le {Array} des options en {Hash} (convenient)
    var options = {} ;
    L(opts).each(function(opt){ options[opt] = true})
    if(undefined == skip_loading) skip_loading = false

    // Les options à passer si le film n'est pas chargé et qu'il faut
    // passer son chargement.
    if(!this.loaded)
    {
      var missing_data = ['auteurs']
      var memorized = false
      for(var i in missing_data)
      {
        if(options[missing_data[i]]) // p.e. options['auteurs']
        {
          /*
           *  Dans le cas où le chargement doit être passé, si des données
           *  optionnelles sont à afficher, on mémorise qu'il faudra charger
           *  ce film à la première occasion.
           *  
           */
          if(skip_loading)
          {
            // On mémorise que le film devra être chargé dès que
            // possible
            if(memorized == false)
            {
              FILMS.need_loading.push(this.id)
              memorized = true
            }
          }
          /*
           *  Dans le cas où il ne faut pas sauter le chargement, il faut
           *  regarder si des données optionnelles sont requises en fonction
           *  des options (par exemple les auteurs) et lancer le chargement
           *  du film le cas échéant.
           *  
           */
          else
          {
            // Le chargement du film est nécessaire
            this.load($.proxy(this.formate, this, options))
            return null
          }
        }
      }
    }
    var t 
    /*
     *  Le titre
     * 
     *  Sauf indication contraire, c'est toujours le titre français qui
     *  est utilisé comme titre principal.
     *  Le titre original n'est affiché que lorsque :
     *    - le titre français n'existe pas
     *    - le titre original est demandé en option, mais pas le titre français
     */
    if(options.titreor && !options.titrefr) t = this.titre
    else t = options.titrefr ? (this.titre_fr || this.titre) : this.titre
    
    var inpar = []
    if(options.titrefr && options.titreor && this.titre_fr) inpar.push(this.titre)
    if(options.annee && this.annee)     inpar.push(this.annee)
    if(options.auteurs && this.auteurs) inpar.push(this.auteurs_as_patronyme)
    if(inpar.length)
    {
      t += " ("+inpar.join(', ')+")"
    }

    // Dans un lien ou un span
    var bal = options.nolink ? '<span' : '<a onclick="FILMS.show(\''+this.id+'\')"' ;
    t = bal + ' class="lk_film">' + t 
    t += options.nolink ? '</span>' : '</a>'

    return t
    
  }
})

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
   *  MÉTHODES D'AFFICHAGE
   *  
   --------------------------------------------------------------------- */
  /*
   *  Retourne les auteurs comme une string de patronymes
   *  
   */
  "auteurs_as_patronyme":{
    get:function(){
      if(!this.auteurs) return ""
      var str = [], auteur ;
      for(var i=0, len=this.auteurs.length; i<len; ++i)
      {
        auteur = this.auteurs[i]
        // TODO: Plus tard,auteur sera une class Person et 
        // répondra à la méthode `patronyme'
        str.push(auteur.prenom + " " + auteur.nom)
      }
      return str.join(', ')
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
        else
        { 
          this.unabled_to_load = true
          F.error(rajax.message)
        }
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
          {script:'film/save', data:this.data_for_save},
          $.proxy(this.save, this, poursuivre)
        )
      }
      else
      { // => Retour sauvegarde
        if(rajax.ok)
        {
          F.show("Film “"+this.titre+"” enregistré.")
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
      if(this.unabled_to_load == true) return // abandon
      if(false == this.loaded) return this.load($.proxy(FILMS.edit, FILMS, this.id))
      FILMS.Edition.set_values( this )
    }
  },
  
  /*
   *  Data en envoyer par la requête d'enregistrement du film
   *  
   */
  "data_for_save":{
    get:function()
    {
      var d = {}
      var my = this
      L(FILMS.Edition.FILM_PROPERTIES).each(function(prop){
        d[prop] = my[prop]
        if(d[prop] == "") d[prop] == null
      })
      return d
    }
  }
  
})