/*
 *  Object FILMS
 *  ------------
 *  Gestion des films pour l'application.
 *
 *  NOTES
 *  -----
 *    ::  L'application charge le fichier '../interdata/film/data_js/films_data.js'
 *        qui définit FILMS.DATA, les données raccourcis des films.
 *
 *  
 */

/*
 *  Raccourci pour `FILMS.get(id)'
 *  
 */
window.get_film = function(fid)
{
  return FILMS.get(fid)
}

window.FILMS = {
  /*
   *  Options pour l'affichage du titre du film
   *  dans la page.
   *  
   */
  OPTIONS:{
    'annee'   :{hname: "Année (A)",           valdef:true}, 
    'titrefr' :{hname: "Titre français (F)",  valdef:false}, 
    'titreor' :{hname: "Titre original (O)",  valdef:false},
    'nolink'  :{hname: "Pas de lien (L)",     valdef:false},
    'auteurs' :{hname: "Auteurs (S)",         valdef:false}
  },
  
  /*
   *  Data mini des films
   *
   *  (cf. ../interdata/film/data_js/films_data.js)
   */
  DATA:null,      

  /*
   *  {Hash} contenant les identifiants des films classés par lettre
   *  Key   : La valeur Ascii de la lettre (ou 0 pour les films commençant 
   *          par un nombre)
   *  Value : {Array} contenant les identifiants des films, classé
   *          alphabétiquement.  
   *  
   *  NOTES
   *  -----
   *    = C'est cette donnée qui est utilisée par FILMS.Dom pour construire
   *      les listings des films d'une liste donnée.
   *
   *    = La pseudo-méthode FILMS.do_film_list_per_letter est appelée au
   *      besoin, c'est-à-dire à la première construction d'un listing.
   *      
   */
  DATA_PER_LETTER:null,

  /*
   *  Table {Hash} des instances de films déjà instancié
   *  
   *  NOTES
   *  -----
   *    ::  Utiliser la méthode FILMS.get(fid) pour pouvoir instancier
   *        une nouvelle instance Film avec les data mini ou renvoyer
   *        celle déjà instanciée
   */
  list:{},
  
  /*
   *  Liste des Identifiants de films qui doivent être chargés
   *  à la première occasion.
   *
   *  Cf. dans la class Film la méthode `formate'
   *  
   *  NOTE TODO POUR LE MOMENT, CE CHARGEMENT N'EST PAS LANCÉ
   */
  need_loading:[],
    
  /*
   *  Retourne la class Film du film d'identifiant +fid+
   *  
   */
  get:function(fid)
  {
    if( undefined != this.list[fid] ) return this.list[fid]
    var film = new Film(fid)
    film.dispatch( this.DATA[fid] )
    return film
  },
    
  /*
   *  Affiche la fiche du film d'identifiant +fid+
   *  TODO
   *  
   */
  show:function(fid)
  {
    F.show("La méthode d'affichage du film n'est pas encore implémentée.")
  },
  
  /*
   *  Met le film d'identifiant +fid+ en édition
   *  
   */
  edit:function(fid)
  {
    this.Edition.edit(fid)
  },
  
  /*
   *  Méthode appelée après avoir choisi un film, quand
   *  on doit l'insérer dans le texte (CMD + F).
   *  
   *  @param  fid   Identifiant du film
   *
   */
  insert_in_input:function(fid)
  {
    UI.Input.set_selection_to( this.get(fid).balise( this.Dom.options_balise ))
  },
  
  /*
   *  Méthode principale appelée pour choisir un film
   *
   *  @param  poursuivre  La méthode pour suivre (elle doit recevoir en premier 
   *                      argument l'id du film choisi)
   *  @param  options     {Hash} des options possibles :
   *                      letter      :  La lettre à afficher, if any  
   *                      keep_opened :  Si TRUE, le panneau ne se fermera pas
   *                                     au choix d'un film
   */
  choose_a_film:function(poursuivre, options)
  {
    if(undefined == poursuivre) throw "Il faut indiquer la méthode pour suivre !"
    if(undefined == options) options = {}
    this.Dom.show_panneau()
    if(options.letter) this.Dom.on_click_onglet(options.letter)
    this.Dom.options = options
    this.on_choose_film.poursuivre = poursuivre
  },
 
  /*
   *  Méthode appelée quand ON CHOISIT UN FILM
   *  ----------------------------------------
   * 
   *  @requis   La méthode pour suivre, à laquelle il faut envoyer cet
   *            identifiant.
   *
   *  @param    film_id   Identifiant du film (dans FILMS.DATA) 
   */
  on_choose_film:function(film_id)
  {
    if(!this.Dom.options.keep_opened) this.Dom.hide_panneau()
    this.on_choose_film.poursuivre(film_id)
  }  
 
}


Object.defineProperties(FILMS,{
  
  /*
   *  Initialise l'objet FILMS
   *  
   */
  "init":{
    get:function(){
      this.need_loading = []
      this.list = {}
      this.DATA = {}
      this.DATA_PER_LETTER = null
    }
  },
  
  /*
   *  Vérifie si FILMS.DATA_PER_LETTER est établie et l'établit le
   *  cas échéant
   *  
   *  @return TRUE si la donnée a déjà été établie, FALSE si elle doit
   *          doit être établie. Cette information est utile, par exemple à
   *          la création d'un nouveau film, pour savoir s'il faut ajouter
   *          le nouveau film à cette liste, ou s'il sera ajouté en construisant
   *          cette liste, puisque le nouveau film a déjà été ajouté à FILMS.DATA
   */
  "check_if_list_per_letter_ok":{
    get:function(){
      if(null != FILMS.DATA_PER_LETTER) return true
      FILMS.do_film_list_per_letter
      return false
    }
  },
  /*
   *  Produit DATA_PER_LETTER (cf. en tête de ce fichier)
   *  
   */
  "do_film_list_per_letter":{
    get:function(){
      var fid, dfilm, iletter ;
      this.DATA_PER_LETTER = {}
      for(fid in this.DATA)
      {
        dfilm = this.DATA[fid]
        if(undefined == this.DATA_PER_LETTER[dfilm.let]) this.DATA_PER_LETTER[dfilm.let] = []
        this.DATA_PER_LETTER[dfilm.let].push(fid)
      }
      // On classe les films
      var letters_count = this.DATA_PER_LETTER.length
      for(iletter=0; iletter<letters_count; ++iletter)
      {
        this.DATA_PER_LETTER[iletter].sort()
      }
    }
  }
  
})