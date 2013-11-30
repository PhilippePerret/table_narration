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
      this.dispatch( rajax.data )
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
  },
  
  check_if_needs_save:function()
  {
    if(false == this.modified) return
    else this.save
  },
  
  /*
   *  Méthode qui dispatche toutes les données +data+ remontées par
   *  la requête ajax `collection/load'
   *
   *  Il s'agit de dispatcher :
   *    - Les fiches (et d'afficher/ouvrir celles qui doivent l'être)
   *    - Les préférences de l'application
   *  
   *  WARNING
   *  -------
   *  Cette méthode ne doit pas être utilisée pour charger seulement une
   *  portion de la collection en cours de travail, car elle ré-initialise la
   *  liste des modifications en fin de dispatch (car la création des fiches
   *  les a marquées modifiées).
   *  En d'autres termes, si des fiches sont chargées en groupe plus tard, il
   *  faut passer par FICHES.dispatch (TODO: mais n'est-ce pas le même problème ?
   *  et ne vaudrait-il pas mieux gérer la marque de la modification de la fiche ?)
   */
  dispatch:function(data)
  {
    // Dispatch des fiches (le plus gros)
    FICHES.dispatch(data.fiches)
    
    // Dispatch des préférences
    // TODO
    
    // Dispatch des autres données
    // TODO
    
    // On supprime toutes les fiches marquées modifiées
    // (cf. le WARNING ci-dessus)
    delete this.modifieds_list
    this.modified = false
    
    // On peut remettre la boucle de sauvegarde en route
    this.start_automatic_saving
    
  }
  
}

Object.defineProperties(Collection,{
  
  "start_automatic_saving":{
    get:function(){
      if(this.timer_save) return
      this.timer_save = setInterval(this.check_if_needs_save, 20 * 1000)
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
      this.stop_automatic_saving
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
   *
   *    * C'est la méthode `check_if_needs_save' qui est appelée en premier
   *      lieu pour voir si un enregistrement est nécessaire (c'est un peu bête,
   *      mais c'est juste parce que j'ai utilisé une propriété, ici.)
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