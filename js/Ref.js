/**
  * @module ref.js
  * 
  */

/**
  * Class pour une référence
  *
  * @class Ref
  * @param  {String} rid Identifiant de la référence : <type>-<id> de la fiche.
  */
window.Ref = function(rid)
{
  var did = rid.split('-')
  this.type = did[0]
  this.id   = did[1]
  REFS.list[rid] = this
}
$.extend(Ref.prototype,{
  /**
    * Format la balise pour affichage
    *
    * @method formate
    * @param  {Fiche}   cible         La fiche qui doit recevoir la référence formatée
    * @param  {Array}   options       Les options d'affichage (liste de mots clés)
    * @param  {Boolean} skip_loading  Si True, ne charge pas la fiche si elle n'est pas
    *                                 encore chargée, donc affichage réduit.
    * @return {String} La balise formatée pour affichage.
    */
  formate:function(cible, options, skip_loading)
  {
    if(undefined != FICHES.list[this.id])
    {
      // La fiche est déjà chargée, on va pouvoir établir un texte complet
      dlog("La fiche est déjà chargée")
    }
    else
    {
      if(false == skip_loading)
      {
        // S'il ne faut pas sauter le chargement, on charge la fiche
        return this.fiche.load($.proxy(this.formate, this, options, skip_loading))
      }
    }
    
    // Construction du texte qui doit être retourné
    var htype = FICHES.datatype[this.type].hname.capitalize()
    if (this.fiche)
    {
      // Un texte complet pour une fiche chargée
      if(this.is_book)
      {
        formated = "livre “"+this.fiche.real_titre+"”"
      }
      else
      {
        var livre = this.in_same_book(cible) ? "" : " ("+this.book_as_titre+")" ;
        formated = htype + " " + this.fiche.titre + livre
      }
    }
    else
    {
      // Un texte basique, juste pour affichage
      formated =  "["+htype+" "+this.id+" (non chargé)]"
    }
    return '<ref onclick="FICHES.show(\''+this.id+'\',\''+this.type+'\')">'+formated+'</ref>'
  }
})

Object.defineProperties(Ref.prototype, {
  /**
    * Instance Fiche de la fiche de la référence
    *
    * @property {Fiche} fiche
    *
    */
  "fiche":{
    get:function(){
      if(undefined == this._fiche && FICHES.list[this.id]){ 
        this._fiche = get_fiche(this.id)
      }
      return this._fiche
    }
  },
  
  /**
    * True si la référence est un livre
    *
    * Notes
    * -----
    *   * C'est un raccourci à this.fiche.is_book
    *
    * @property {Boolean} is_book
    *
    */
  "is_book":{
    get:function(){
      return this.fiche.is_book
    }
  },
  /**
    * Return TRUE si la fiche de la référence est dans le même livre que 
    * la cible +fiche+
    *
    * @method in_same_book
    * @param  {Fiche} cible   La fiche cible (qui doit recevoir la référence)
    * @return {Boolean} True si la référence appartient au même livre que la +cible+
    *
    */
  "in_same_book":{
    value:function(cible){
      if(cible.is_book) book_cible_id = cible.id
      else if(cible.book) book_cible_id = cible.book.id
      else return false
      return book_cible_id == this.book_id
    }
  },
  
  /**
    * Retourne l'instance {Fiche} de la référence courante
    *
    * Notes
    * -----
    *   * Pour obtenir cette information, il faut obligatoirement que
    *     la fiche de la référence soit chargée.
    *
    * @property {Fiche} book
    *
    */
  "book":{
    get:function(){ return this.fiche.book }
  },
  
  /**
    * Retourne l'identifiant du livre de la référence
    *
    * Notes
    * -----
    *   * Pour obtenir cette information, il faut obligatoirement que
    *     la fiche de la référence soit chargée.
    *
    * @property book_id
    * @type {String|Number}
    */
  "book_id":{
    get:function(){
      return this.book.id
    }
  },
  
  /**
    * Le titre du livre précédé de "Livre"
    * Notes
    * -----
    *   * Cette méthode est appelée lorsque la fiche est chargée et qu'elle
    *     appartient à un autre livre que le livre où doit apparaitre la référence.
    *
    * @property book_as_titre
    * @type     {String}
    */
  "book_as_titre":{
    get:function(){
      var titre ;
      if(this.fiche.is_book) titre = this.fiche.real_titre
      else if(this.book) titre = this.book.real_titre
      else titre = "INEXISTANT"
      return "livre “"+titre+"”"
    }
  }
})