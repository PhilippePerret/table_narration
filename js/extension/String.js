/**
 *
 *  Extensions de la classe String propre à l'application.
 *
 *  @module String
 *
 **/

$.extend(String.prototype,{
  
})

Object.defineProperties(String.prototype, {
  
  /**
   *  Formate le string pour affichage (en remplaçant notamment les balises films,
   *  scénodico, etc.)  
   *
   *  NOTES
   *  -----
   *    * C'est un raccourci pour ColText.formate(<this>, <cible>)
   *
   *  @method formate
   *  @param  {Fiche} cible   La fiche cible du lien (utile pour les références)
   *  @return {String} Le string courant formaté.
   *  @example
   *      <texte>.formate
   */
  "formate":{
    value:function(cible){
      return ColText.formate(this.toString(), cible)
    }
  }
  
})