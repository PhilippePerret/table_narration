/**
 *  @module DICO.js
 */

/**
 *  Object DICO
 *  ------------
 *  Gestion des mots du scénodico pour l'application.
 *
 *  NOTES
 *  -----
 *    ::  L'application charge le fichier '../interdata/scenodico/data_js/dico_data.js'
 *        qui définit DICO.DATA, les données raccourcis des mots.
 *
 *  @class DICO
 *  @static
 *  @extends OBJET
 */
window.DICO = DICO || {}
$.extend(DICO, {
  
  NAME:"DICO",
  
  /**
    * Options pour l'affichage du mot
    * dans la page.
    * @property {Object} OPTIONS
    * @static
    */
  OPTIONS:{
    // 'annee'   :{hname: "Année (A)",           valdef:true}, 
  },
    
  /*
   *  Liste des Identifiants de mots qui doivent être chargés
   *  à la première occasion.
   *
   *  Cf. dans la class {Mot} la méthode `formate'
   *  
   *  NOTE TODO POUR LE MOMENT, CE CHARGEMENT N'EST PAS LANCÉ
   */
  need_loading:[],
    
  /*
   *  Class des items de l'objet ({Classe})
   *  
   */
  Class: Mot,

})