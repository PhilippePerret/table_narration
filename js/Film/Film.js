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
window.FILMS = {
  DATA:null,      // Data mini des films (cf. ../interdata/film/data_js/films_data.js)

  /*
   *  Retourne la balise à insérer pour le film d'identifiant +fid+
   *  
   */
  balise_for:function(fid)
  {
    return "[film:"+fid+"|"+this.DATA[fid].titre+"]"
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
    FICHES.set_selection_to( this.balise_for( fid ) )
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