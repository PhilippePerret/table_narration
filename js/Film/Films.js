/**
  * @module FILMS
  */

/**
  *  Object FILMS
  *  ------------
  *  Gestion des films pour l'application.
  *
  *  NOTES
  *  -----
  *    ::  L'application charge le fichier '../interdata/film/data_js/films_data.js'
  *        qui définit FILMS.DATA, les données raccourcis des films.
  *
  * @class FILMS
  * @static
  * @extends OBJETS
  */
window.FILMS = FILMS || {}
$.extend(FILMS, {

  NAME:"FILMS",

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
   *  Liste des Identifiants de films qui doivent être chargés
   *  à la première occasion.
   *
   *  Cf. dans la class Film la méthode `formate'
   *  
   *  NOTE TODO POUR LE MOMENT, CE CHARGEMENT N'EST PAS LANCÉ
   */
  need_loading:[],
    
  /*
   *  Class des items de l'objet ({Classe})
   *  
   */
  Class: Film,
  
    
})

