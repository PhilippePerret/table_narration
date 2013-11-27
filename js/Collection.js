/*
 *  Objet Collection
 *  ----------------
 *  Gestion de la collection dans son ensemble
 *
 *  Hiérarchie
 *  ----------
 *    Collection
 *      Livres {Book < Fiche}
 *        Chapters {Chapter < Fiche}
 *          Pages {Page < Fiche}
 *            Paragraphs {Paragraph < Fiche}
 *
 */
window.Collection = {
  
  /*
   *  Ajoute une fiche modifiée et marque la collection modifiée, pour sauver
   *  les éléments au prochain tour de sauvegarde.
   *  
   */
  modified: false,
  add_modified:function(fiche)
  {
    if(!this.modifieds_list) this.modifieds_list = []
    this.modifieds_list.push( fiche )
    this.modified = true
  }
}