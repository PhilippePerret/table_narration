/*
 *  Objet OBJETS mixé dans les FILMS, DICO et REFS
 *
 *  NOTES
 *  -----
 *    = Les descriptions ci-dessous, lorsqu'elles ne parlent que de "Film"
 *      peuvent être comprise pour tout objet pluriel mixant ces méthodes.
 *  
 */
window.OBJETS = {
  /*
   *  Data mini de L'objet
   *
   *  Pour les films, cf. :
   *    ../interdata/film/data_js/films_data.js
   *  Pour les mots cf. :
   *    ../interdata/scenodico/data_js/dico_data.js
   *
   */
  DATA:null,      
  

  /*
   *  {Hash} contenant les identifiants des items (film ou mot) classés par lettre
   *  Key   : La valeur Ascii de la lettre (ou 0 pour les films commençant 
   *          par un nombre)
   *  Value : {Array} contenant les identifiants des items, classé
   *          alphabétiquement.  
   *  
   *  NOTES
   *  -----
   *    = C'est cette donnée qui est utilisée par FILMS.Dom et DICO.Dom pour
   *      construire les listings d'une lettre donnée.
   *
   *    = La pseudo-méthode (FILMS|DICO).do_item_list_per_letter est appelée au
   *      besoin, c'est-à-dire à la première construction d'un listing.
   *      
   */
  DATA_PER_LETTER:null,

  /*
   *  Table {Hash} des instances d'item ({Film} ou {Mot}) déjà instancié
   *  
   *  NOTES
   *  -----
   *    ::  Utiliser la fonction `get_mot' ou `get_film' pour appeler une
   *        instance contenue dans cette liste.
   *
   */
  list:{},
  
  /*
   *  Retourne l'« identifiant méthode » pour le débuggage
   *  
   */
  idm:function(method)
  {
    return this.NAME+"."+method
  },
  
  /*
   *  Retourne la class {Film} ou {Mot} de l'item d'identifiant +id+
   *  
   */
  get:function(id)
  {
    dlog("-> "+this.idm('get')+"("+id+")")
    if( undefined != this.list[id] ) return this.list[id]
    var item = new this.Class(id)
    item.dispatch( this.DATA[id] )
    dlog("<- "+this.idm('get'))
    return item
  },
  
  /*
   *  Met l'item {Film} ou {Mot} d'identifiant +id+ en édition
   *  
   */
  edit:function(id)
  {
    this.Edition.edit(id)
  },
  
  /*
   *  Méthode appelée après avoir choisi un film/mot, quand
   *  on doit l'insérer dans le texte.
   *  
   *  @param  id   Identifiant du {Film} ou du {Mot}
   *
   */
  insert_in_input:function(id)
  {
    UI.Input.set_selection_to( this.get(id).balise( this.Dom.options_balise ))
  },
  
  /*
   *  Méthode principale appelée pour choisir un film/Mot/Ref
   *
   *  @param  poursuivre  La méthode pour suivre (elle doit recevoir en premier 
   *                      argument l'id du film choisi)
   *  @param  options     {Hash} des options possibles :
   *                      letter      :  La lettre à afficher, if any  
   *                      keep_opened :  Si TRUE, le panneau ne se fermera pas
   *                                     au choix d'un film
   */
  choose_an_item:function(poursuivre, options)
  {
    if(undefined == poursuivre) throw "Il faut indiquer la méthode pour suivre !"
    if(undefined == options) options = {}
    this.Dom.show_panneau()
    if(options.letter) this.Dom.on_click_onglet(options.letter)
    this.Dom.options = options
    this.on_choose_item.poursuivre = poursuivre
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
  on_choose_item:function(film_id)
  {
    if(!this.Dom.options.keep_opened) this.Dom.hide_panneau()
    this.on_choose_item.poursuivre(film_id)
  }  
  
}


OBJETS_defined_properties = {
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
      dlog("-> "+this.NAME+".check_if_list_per_letter_ok", DB_FCT_ENTER)
      if(null != this.DATA_PER_LETTER)
      {
        dlog("<- "+this.NAME+".check_if_list_per_letter_ok (return TRUE => DATA_PER_LETTER déjà établi)", DB_FCT_ENTER)
        return true
      } 
      this.do_item_list_per_letter
      dlog("<- "+this.NAME+".check_if_list_per_letter_ok (après établissement de DATA_PER_LETTER)", DB_FCT_ENTER )
      return false
    }
  },
  
  /*
   *  Produit DATA_PER_LETTER (cf. en tête de ce fichier)
   *  
   */
  "do_item_list_per_letter":{
    get:function(){
      dlog("-> "+this.NAME+".do_item_list_per_letter", DB_FCT_ENTER)
      var id, ditem, iletter ;
      this.DATA_PER_LETTER = {}
      for(id in this.DATA)
      {
        ditem = this.DATA[id]
        if(undefined == this.DATA_PER_LETTER[ditem.let]) this.DATA_PER_LETTER[ditem.let] = []
        this.DATA_PER_LETTER[ditem.let].push(id)
      }
      // On classe les films/mots
      var letters_count = this.DATA_PER_LETTER.length
      for(iletter=0; iletter<letters_count; ++iletter)
      {
        this.DATA_PER_LETTER[iletter].sort()
      }
    }
  }
  
}

Object.defineProperties(OBJETS, OBJETS_defined_properties)
if('undefined'==typeof FILMS) FILMS = {}
$.extend(FILMS, OBJETS)
Object.defineProperties(FILMS, OBJETS_defined_properties)
if('undefined'==typeof DICO) DICO = {}
$.extend(DICO, OBJETS)
Object.defineProperties(DICO, OBJETS_defined_properties)