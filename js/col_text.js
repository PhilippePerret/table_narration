/**
 *
 *  @module ColText
 *
 **/

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
   *  Le code en traitement courant
   *
   *  @property code 
   *  @type     {String}  
   *  @default  null
   */
  code:null,
  
  /**
   *  Met en forme le texte +code+ pour son affichage humain
   *
   *
   *  @method formate
   *  @param  code    {String} du texte à formater
   *  @return {String}  Le code mis en forme, prêt à être affiché dans un DIV/SPAN
   *                    ou un aperçu.
   *
   *  @example
   *      ColText.formate(<le texte>)
   *      # Mais on peut utiliser aussi :
   *      <le texte>.formate
   *
   */
  formate:function(code)
  {
    this.code = code
    if(code.indexOf('[film:')) this.traite_balises_films()
    if(code.indexOf('[mot:]')) this.traite_balises_mots()
    if(code.indexOf('[ref:]')) this.traite_balises_refs()
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
  traite_balises_refs:function()
  {
    var c, dfilm ;
    this.code = this.code.replace(/\[ref:([^\|]+)\|([^\]\|]+)\|?([^\]]+)?\]/g, function(match, id, title, options, offset){ 
      return get_ref(id).formate(options.split(' '), skip_loading = true)
      /*
       *  La précision skip_loading ci-dessus permet de passer les données
       *  manquante, lorsque des options d'affichage de la référence nécessite d'avoir
       *  les données complètes et qu'elles ne sont pas encore chargées.
       */
    })
  }
  
  
  
}
