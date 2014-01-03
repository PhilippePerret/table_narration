/**
 *
 *  Extensions de la classe String propre à l'application.
 *
 *  @module String
 *
 **/

$.extend(String.prototype,{
  /**
    * Prend un "template" (par exemple une locale) et remplace tous les mots
    * "_<MOT>_" par les valeurs fournies en argument.
    * @method templatize
    * @param  {Object} params Table de remplacement. Les clés seront transformées en
    *                         majuscules.
    */
  templatize:function(params)
  {
    var transformed = this.toString(), reg ;
    L(params).each(function(balise, replacement){
      reg = new RegExp("_"+balise.toUpperCase()+"_", "g")
      transformed = transformed.replace(reg, replacement)
    })
    return transformed
  }
  
})

Object.defineProperties(String.prototype, {
  
  
  /**
    * Formate le string pour affichage (en remplaçant notamment les balises films,
    * scénodico, etc.)  
    *
    * NOTES
    * -----
    *   * C'est un raccourci pour ColText.formate(<this>, <cible>)
    *
    * @method formate
    * @param  {Fiche}   cible   La fiche cible du lien (utile pour les références)
    * @return {String}  Le string courant formaté.
    * @example
    *     <texte>.formate
    */
  "formate":{
    value:function(cible){
      return ColText.formate(this.toString(), cible)
    }
  },
  
  
  /**
    * Formate une balise (tag) HTML en fonction des attributs transmis
    * Notes
    *   * La méthode n'est pas très pertinente en mode simple, mais peut le devenir
    *     lorsque les attributs sont définis dynamiquement.
    *   * La méthode ne retourne QUE l'ouverture de la balise, pas sa fermeture,
    *     sauf bien entendu quand il s'agit d'une fiche sans fermeture (img, input)
    *   * Si une value est NULL ou FALSE, elle est passée. Donc, pour mettre un
    *     null ou un false dans un champ, il faut le donner en string : "null" ou
    *     "false".
    *
    * @method to_tag
    * @param  {Object} attrs    Attributs à placer
    * @return {String} La balise d'ouverture formatée
    * @example
    *   menu = "select".to_tag({id:"monId", onclick:"clean()"})
    *   //=>   <select id="monId" onclick="clean()">
    */
  "to_tag":{
    value:function(attrs){
      var this_str = this.toString()
      code = "<" + this_str
      for(attr in attrs)
      {
        if(false == attrs.hasOwnProperty(attr)) continue
        if(!attrs[attr]) continue
        code += ' ' + attr + '="'+attrs[attr]+'"'
      }
      if(this_str == 'img' || this_str == 'input')
        code += ' />'
      else code += '>'
      
      return code
    }
  }
  
})