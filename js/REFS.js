/**
  * @module REFS.js
  *
  */
/**
  * @class REFS
  * @static
  */
window.REFS = window.REFS || {}
$.extend(window.REFS,{
  /**
    * Liste {Object} des références instanciées. En clé l'identifiant de la
    * référence, composée de <type>-<id> de la fiche et en valeur l'instance {Ref}.
    *
    * @property list
    * @type     {Object}
    * @default  {}
    */
  list:{},
  
  /**
    * Retourne l'instance Ref de la référence (la prend dans les références déjà
    * instanciées ou crée une nouvelle instance).
    * @method get
    * @param  {String} rid Identifiant de la référence telle qu'on peut la trouver
    *                      dans une balise. P.e. "chap-3"
    * @return {Ref} Instance de la référence
    *
    */
  get:function(rid)
  {
    if(this.list[rid]) return this.list[rid]
    else
    {
      // Il faut créer une instance pour cette référence
      return new Ref(rid)
    }
  }
})