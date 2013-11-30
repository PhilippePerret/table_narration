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
   *  Retour du chargement de la collection
   *  Il faut maintenant dispatcher les éléments et remplir la table
   *  
   *  À la fin du chargement, on lance une sauvegarde
   */
  retour_load:function(rajax)
  {
    F.clean()
    if(rajax.ok)
    {
      
    }
    else F.error(rajax.message)
    this.loading = false
    this.backup
  },
  // Noter que ce retour n'est utilisé que lorsqu'on force un backup
  // différent du backup quotidien.
  retour_backup:function(rajax)
  {
    if(rajax.ok) F.show("Backup done!")
    else F.error(rajax.message)
  },
  
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
  
  "start_automatic_saving":{
    get:function(){
      if(this.timer_save) return
      this.timer_save = setInterval(this.save, 20 * 1000)
    }
  },
  "stop_automatic_saving":{
    get:function(){
      if(!this.timer_save) return
      clearInterval(this.timer_save)
      delete this.timer_save
    }
  },
  
  /*
   *  Chargement de la collection (normale ou test)
   *  
   */
  "load":{
    get:function(){
      this.loading = true
      F.show("Chargement de la collection…", {timer:false})
      Ajax.send({script:'collection/load'}, $.proxy(this.retour_load, this))
    }
    
  },
  
  
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
      FICHES.save($.proxy(this.end_save, this))
    }
  },
  /* Fin de la sauvegarde de la collection */
  "end_save":{
    get:function(){ 
      this.saving = false 
    }
  },
  
  /*
   *  Lance le backup journalier
   *  
   *  Cette procédure est lancée tout de suite après le chargement de la
   *  collection courante (sauf en mode test).
   *
   */
  "backup":{
    get:function(){Ajax.send({script:'collection/backup'})}
  },
  /*
   *  Force un nouveau backup (avec l'heure)
   *  
   *  Sauf en mode test
   *
   */
  "force_backup":{
    get:function(){
      Ajax.send({script:'collection/backup', force_backup:1}, $.proxy(this.retour_backup,this))
    }
  }
  
})