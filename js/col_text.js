/*
 *  Objet ColText
 *  -------------
 *  Gestion des textes de la collection (toutes les fiches)
 *  
 */
window.ColText = {
  
  /*
   *  Le code en traitement courant
   *  
   */
  code:null,
  
  /*
   *  Met en forme le texte +code+ pour son affichage humain
   *
   *
   *  @param  code    {String} du texte à formater
   *
   *  @return Le code mis en forme, prêt à être affiché dans un DIV/SPAN
   *
   */
  formate:function(code)
  {
    this.code = code
    if(code.indexOf('[film:')) this.traite_balises_films()
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
  }
  
}
