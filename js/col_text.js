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
   *  @param  options {Hash} des options (INUTILISÉ POUR LE MOMENT)
   *
   *  @return Le code mis en forme, prêt à être affiché dans un DIV/SPAN
   *
   */
  formate:function(code, options)
  {
    this.code = code
    if(code.indexOf('[film:')) this.traite_balises_films( options )
    return this.code
  },
  
  /*
   *  Traitement des balises films
   *  
   */
  traite_balises_films:function(options)
  {
    var c, dfilm ;
    this.code = this.code.replace(/\[film:([^\|]+)\|([^\]]+)\]/g, function(match, fid, ftitre, offset){
      dfilm = get_film( fid )
      console.dir(dfilm)
      c = '<a onclick="FILMS.show(\''+fid+'\')" class="lk_film">'+ftitre+'</a>' ;
      if( dfilm.annee ) c += ' ('+ dfilm.annee +')' ;
      return c
    })
  }
  
}
