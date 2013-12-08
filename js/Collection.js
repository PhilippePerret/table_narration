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
   *  CONSTANTE
   *  
   */
  frequence_saving: 20 * 1000, // 5*1000
  
  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  /* Propriétés d'état */
  saving        : false,
  loading       : false,
  
  /*
   *  Retour du chargement de la collection
   *  Il faut maintenant dispatcher les éléments et remplir la table
   *  
   *  À la fin du chargement, on lance une sauvegarde et on prépare l'interface
   *  si nécessaire.
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
    if(false == UI.prepared) UI.prepare
    if(rajax.mode_test == true){ 
      // NON :
      // App.test();
      // Sinon, ça arrive chaque fois qu'un test recharge
      F.show("Penser à quitter le mode test en finissant, par commodité.")
    }
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
    // console.log("-> Collection.check_if_needs_save (modified:"+this.modified+")")
    if(this.modified === true)
    {
      this.save
      return true
    } 
    else
    {
      return false
    }
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
    this.dispatch_data(data.data)
    
    // On supprime toutes les fiches marquées modifiées
    // (cf. le WARNING ci-dessus)
    delete this.modifieds_list
    this.modified = false
    
    // On peut remettre la boucle de sauvegarde en route
    this.start_automatic_saving
    
  },
  
  /*
   *  Dispatch des autres données remontées au chargement
   *  
   */
  dispatch_data:function(data)
  {
    FICHES.last_id = parseInt(data.last_id_fiche, 10)
  }
  
}

Object.defineProperties(Collection,{
  
  "saving_forbidden":{
    get:function(){return this._saving_forbidden || false },
    set:function(forbid){
      this._saving_forbidden = forbid
      this.regle_mark_saved
    }
  },
  
  "regle_mark_saved":{
    get:function()
    {
      var mod = this.modified, forb = this.saving_forbidden ;
      $('span#mark_saved_no')       [!forb && mod  ? 'show' : 'hide']()
      $('span#mark_saved_yes')      [!mod && !forb ? 'show': 'hide']()
      $('span#mark_saved_forbidden')[forb ? 'show':'hide']()
    }
  },
  
  "start_automatic_saving":{
    get:function(){
      if(this.timer_save || $('input#cb_automatic_save')[0].checked==false) return
      this.timer_save = setInterval(
        $.proxy(this.check_if_needs_save, this), this.frequence_saving
      )
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
   *  Méthode appelée quand on clique sur le "Auto" de l'enregistrement
   *  automatique. L'active ou le désactive.
   *
   *  La méthode est aussi appelée quand on charge l'application, pour
   *  remettre l'état précédent.
   *  
   */
  "enable_automatic_saving":{
    value:function(oui){
      if(oui){ 
        this.start_automatic_saving
      }
      else if(this.timer_save){ 
        this.stop_automatic_saving
      }
      $('label[for="cb_automatic_save"]')[oui ? 'addClass' : 'removeClass']('on')
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
      dlog("Sauvegarde de la collection", DB_SIMPLE)
      this.saving = true
      this.save_fiches
    }
  },
  /* Sauvegarde des fiches */
  "save_fiches":{
    get:function(){
      // console.log("-> Collection.save_fiches")
      FICHES.save( $.proxy(this.end_save, this ))
    }
  },
  /* Fin de la sauvegarde de la collection */
  "end_save":{
    get:function(){ 
      this.saving   = false
      this.modified = false
    }
  },
  
  /*
   *  Marque la collection modifiée/non modifié
   *    
   */
  "modified":{
    get:function(){ return this._modified || false },
    set:function( modified ){
      this._modified = modified
      this.regle_mark_saved
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