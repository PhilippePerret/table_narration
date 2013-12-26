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
      if(!this.code) return // => asynchrone
    }
    /*  Il faut absolument utiliser `this.code` ci-dessous, car la méthode
     *  this.traite_code_by_ptype ci-dessus peut avoir changé la valeur du 
     *  code (lorsque le paragraphe n'est pas de ptype 'text')
     */
    if(this.code.indexOf('[film:')) this.traite_balises_films()
    if(this.code.indexOf('[mot:]')) this.traite_balises_mots()
    if(this.code.indexOf('[ref:]')) this.traite_balises_refs(cible)
    if(this.code.indexOf('[img:]')) this.traite_balises_images()
    return this.code
  },
  
  /*
   *  Traitement des balises films
   *  
   */
  traite_balises_films:function()
  {
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
    * Traitement des balises de type image dans le texte du paragraphe
    * Notes
    *   * Une balise de type image possède ce format :
    *       [img:path/in/collection/ressource/img/|attrs]
    *       où `attrs` est un {Object} en string qui doit pouvoir être parsé par
    *       JSON et qui défini les attributs de l'image.
    *       @example :
    *           [img:mon_image.png|{"id":"idimage", "title":"Titre de l'image"}]
    *   * Donc une image doit obligatoirement être contenue dans le dossier
    *     ressource/img/ de la collection.
    *
    * @method traite_balises_images
    * @products Le traitement de this.code
    */
  traite_balises_images:function()
  {
    this.code = this.code.replace(/\[img:([^\|\]]+)(?:\|([^\]]+))?\]/g, function(match, path, attrs, offset){
      if(attrs) attrs = attrs.split(' ')
      return image_ressource(path, attrs)
    })
  },
  
  /**
    * Traitement du code d'un paragraphe dont le ptype n'est pas 'text'
    * Notes
    *   * La méthode est asynchrone seulement pour les ptype(s) 'file' et 'fico'
    *     Dans le cas contraire, on rappelle immédiatement la méthode formate.
    *
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
      // Rien à faire
      return
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
      c = ipara.real_text
      if(!c)
      {
        ipara.load_file($.proxy(this.formate, this))
      }
      break
    case 'fico':
      break
    }
    this.code = c
  }
  
  
}
