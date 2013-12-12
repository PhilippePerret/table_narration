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
    F.show("La méthode d'édition des films n'est pas encore implémentée.")
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
   *                      lettre      :  La lettre à afficher, if any  
   *                      keep_opened :  Si TRUE, le panneau ne se fermera pas
   *                                     au choix d'un film
   */
  choose_a_film:function(poursuivre, options)
  {
    if(undefined == poursuivre) throw "Il faut indiquer la méthode pour suivre !"
    if(undefined == options) options = {}
    this.Dom.show_panneau()
    if(options.lettre) this.Dom.on_click_onglet(options.lettre)
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
    }
  }
  
})