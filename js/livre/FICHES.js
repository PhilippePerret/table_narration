/*
 *  Objet Pluriel FICHES
 *  --------------------
 *
 */
window.FICHES = {
  
  /*
   *  CONSTANTES
   *  
   */
  datatype:{
    'para'  : {level: 5 },
    'page'  : {level: 10},
    'chap'  : {level: 15},
    'book'  : {level: 20}
    },

  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  last_id: -1,
  
  /*
   *  List {Hash} des fiches instanciées
   *  ----------------------------------
   *  En clé, l'identifiant ({Number}), en valeur l'instance de la fiche
   *
   *  C'est la méthode `create' de la fiche qui la met dans la liste
   *
   */
  list:{},
  /*
   *  Nombre de fiches dans `list'
   */
  length:0,
  
  /*
   *  {Hash} des fiches sélectionnées
   *  
   *  En clé, l'ID de la fiche, en valeur, son instance
   */
  selecteds:null,
  
  /*
   *  Fiche courante (instance Fiche)
   *  
   */
  current:null
  
}

