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
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  /* Propriétés d'état */
  saving        : false,
  loading       : false,
  modified      : false,
  
  /*
   *  Ajoute une fiche modifiée et marque la collection modifiée, pour sauver
   *  les éléments au prochain tour de sauvegarde.
   *  
   */
  add_modified:function(fiche)
  {
    if(!this.modifieds_list) this.modifieds_list = []
    this.modifieds_list.push( fiche )
    this.modified = true
  }
}

Object.defineProperties(Collection,{
  
  /*
   *  Sauvegarde de tous les éléments de la collection
   *  (principalement les fiches)
   *  
   *  NOTES
   *  -----
   *    * Les fiches à sauvegarder (ou supprimer) sont contenues dans la liste
   *      this.modifieds_list (sous forme d'instances)
   */
  "save":{
    get:function(){
      this.saving = true
      this.save_fiches
    }
  },
  /* Sauvegarde des fiches */
  "save_fiches":{
    get:function(){
      this.end_save // fin de la sauvegarde
    }
  },
  /* Fin de la sauvegarde de la collection */
  "end_save":{
    get:function(){ 
      this.saving = false 
    }
  }
})