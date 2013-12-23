/**
  * @module ColText
  */

/**
  *  Objet ColText
  *  -------------
  *  Gestion des textes de la collection (toutes les fiches).
  *  C'est cet objet par exemple qui va traiter les balises que contient un texte
  *  avant de l'afficher.
  *  
  *  @class ColText
  *  @static
  *
  **/
window.ColText = {
  
  /**
    *
    * Le code en traitement courant
    *
    * @property code 
    * @type     {String}  
    * @default  null
    */
  code:null,
  
  /**
    * Met en forme le texte +code+ pour son affichage humain
    *
    * Notes
    * -----
    *   * La méthode peut devenir asynchrone lorsqu'il s'agit du texte
    *     d'un paragraphe dont le ptype nécessite l'interprétation d'un code
    *     dans un langage autre que javascript ou que c'est un fichier à
    *     charger.
    *
    * @method formate
    * @param  {String}  code    Le texte à formater
    * @param  {Fiche}   cible   Pour les références, ainsi que pour les corrections
    *                           suivant le ptype du paragraphe, on a besoin de la cible
    * @return {String}  Le code mis en forme, prêt à être affiché dans un DIV/SPAN
    *                   ou un aperçu.
    *
    * @example
    *     ColText.formate(<le texte>)
    *     # Mais on peut utiliser aussi :
    *     <le texte>.formate
    *
    */
  formate:function(code, cible)
  {
    this.code = code
    if(cible.is_paragraph && cible.ptype != 'text')
    {
      this.traite_code_by_ptype(cible)
    }
    if(code.indexOf('[film:')) this.traite_balises_films()
    if(code.indexOf('[mot:]')) this.traite_balises_mots()
    if(code.indexOf('[ref:]')) this.traite_balises_refs(cible)
    return this.code
  },
  
  /*
   *  Traitement des balises films
   *  
   */
  traite_balises_films:function()
  {
    var c, dfilm ;
    this.code = this.code.replace(/\[film:([^\|]+)\|([^\]\|]+)\|?([^\]]+)?\]/g, function(match, fid, ftitre, options, offset){ 
      return get_film(fid).formate(options.split(' '), skip_loading = true)
      /*
       *  La précision skip_loading ci-dessus permet de passer les données
       *  manquante, lorsque des options d'affichage du film nécessite d'avoir
       *  les données complètes et qu'elles ne sont pas encore chargées.
       */
    })
  },
  
  /*
   *  Traitement des balises mots
   *  
   */
  traite_balises_mots:function()
  {
    var c, dfilm ;
    this.code = this.code.replace(/\[mot:([^\|]+)\|([^\]\|]+)\|?([^\]]+)?\]/g, function(match, id, title, options, offset){ 
      return get_mot(id).formate(options.split(' '), skip_loading = true)
      /*
       *  La précision skip_loading ci-dessus permet de passer les données
       *  manquante, lorsque des options d'affichage du film nécessite d'avoir
       *  les données complètes et qu'elles ne sont pas encore chargées.
       */
    })
  },
  
  /*
   *  Traitement des balises références
   *  
   */
  traite_balises_refs:function(cible)
  {
    var c, dfilm ;
    this.code = this.code.replace(/\[ref:([^\|]+)\|([^\]]+)\]/g, function(match, id, title, offset){ 
      return get_ref(id).formate(cible, title, skip_loading = true)
      /*
       *  La précision skip_loading ci-dessus permet de passer les données
       *  manquante, lorsque des options d'affichage de la référence nécessite d'avoir
       *  les données complètes et qu'elles ne sont pas encore chargées.
       */
    })
  },
  
  
  /**
    * Traitement du code d'un paragraphe dont le ptype n'est pas 'text'
    * Notes
    *   * La méthode est asynchrone seulement pour les ptype(s) 'file' et 'fico'
    * @method traite_code_by_ptype
    * @async
    * @param  {Paragraph} ipara   L'instance du paragraphe
    */
  traite_code_by_ptype:function(ipara)
  {
    dlog("Paragraphe " + ipara.type_id + " traité comme "+ipara.ptype)
    var c = this.code
    switch(ipara.ptype)
    {
    case 'text':
      break
    case 'list':
      c = L(c.split("\n")).collect(function(line){return '<li>'+line+'</li>'}).join('')
      c = '<ul>'+c+'</ul>'
      break
    case 'enum':
      c = L(c.split("\n")).collect(function(line){return '<li>'+line+'</li>'}).join('')
      c = '<ol>'+c+'</ol>'
      break
    case 'desc':
      // Liste de description "mot::description\nmot::description"
      var desc, mot ;
      c = L(c.split("\n")).collect(function(line){
        desc = line.split('::')
        return '<dt>'+desc.shift()+'</dt><dd>'+desc.join('::')+'</dd>'
      }).join('')
      c = '<dl>'+c+'</dl>'
      break
    case 'code':
      try
      {
        eval("c=function(){"+c+"}()")
      }
      catch(err)
      {
        F.error(err+LOCALE.paragraph.error['code must be valid'])
      }
      break
    case 'file':
      break
    case 'fico':
      break
    }
    this.code = c
  }
  
  
}
