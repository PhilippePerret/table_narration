/**
  * @module Collection
  */

/**
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
  * @class Collection
  * @static
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
  loaded        : false,
  
  /*
   *  {Array} Livres de {Book} de la collection
   *
   *  NOTES
   *  -----
   *  Cette liste est établie au chargement de la collection en insérant
   *  toutes les fiches de type {Book}. C'est la méthode FICHES.dispatch qui
   *  s'en charge.
   *
   */
  books:[],
  
  /*
   *  Retour du chargement de la collection
   *  Il faut maintenant dispatcher les éléments et remplir la table
   *  
   *  À la fin du chargement, on lance une sauvegarde et on prépare l'interface
   *  si nécessaire.
   */
  retour_load:function(rajax)
  {
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
      F.show("Penser à quitter le mode test en finissant, par commodité.", {keep:true})
    }
    if( rajax.paragraph_styles_updated ) F.show("La liste des styles de paragraphe a été updatée.")
    this.backup
  },
  
  // Noter que ce retour n'est utilisé que lorsqu'on force un backup
  // différent du backup quotidien.
  retour_backup:function(rajax)
  {
    if(rajax.ok) F.show("Backup done!", {keep:true})
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
    // console.log("---> Collection.check_if_needs_save (modified:"+this.modified+")")
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
    // @note Sauf si la sauvegarde automatique n'est pas activée
    this.start_automatic_saving
    
    this.loaded = true
  },
  
  /*
   *  Dispatch des autres données remontées au chargement
   *  
   */
  dispatch_data:function(data)
  {
    FICHES.last_id = parseInt(data.last_id_fiche, 10)
    // Configuration courante (note: le fait de la définir l'applique)
    App.current_configuration = data.current_configuration
  }
  
}

Object.defineProperties(Collection,{
  
  /**
    * Les deux méthodes `disable_save' et 'enable_save' permettent
    * d'activer ou non la sauvegarde automatique (lorsque l'option AUTO
    * est activé)
    * 
    * Notes
    * -----
    *   * Ce sont des méthodes complexes, donc à invoquer sans parenthèses.  
    *   * UTILISER CES DEUX MÉTHODES plutôt que stop_automatic_saving et
    *     start_automatic_saving.
    *   * L'idéal est même d'utiliser `stop_save` (exactement) et `restart_save`
    *     qui arrête et relance la sauvegarde automatique seulement dans le cas
    *     où elle est activée (cf. les handy methods)
    *
    * @method disable_save
    *
    */
  "disable_save":{
    get:function(){
      this.save_is_disable = true
      this.stop_automatic_saving
      this.regle_mark_saved
    }
  },
  /**
    * Réactive la sauvegarde automatique
    * Notes
    * -----
    *   * Lire les notes de la méthode `disable_save`
    *
    * @method enable_save
    *
    */
  "enable_save":{
    get:function(){
      this.save_is_disable = false
      this.start_automatic_saving
      this.regle_mark_saved
    }
  },
  
  "regle_mark_saved":{
    get:function()
    {
      var mod = this.modified, forb = this.save_is_disable ;
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
   *  NOTES
   *  -----
   *    :: La méthode `save' est appelée dès qu'on active le bouton
   *  
   */
  "enable_automatic_saving":{
    value:function(oui){
      this.AUTOMATIC_SAVING = oui
      if(oui){ 
        this.start_automatic_saving
        if(this.loaded) this.save
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
      stop_save
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
      F.show("Sauvegarde en cours…", {no_timer:true})
      this.saving = true
      this.save_fiches
    }
  },
  /* Sauvegarde des fiches */
  "save_fiches":{
    get:function(){
      // console.log("---> Collection.save_fiches")
      FICHES.save( $.proxy(this.end_save, this ))
    }
  },
  /* Fin de la sauvegarde de la collection */
  "end_save":{
    get:function(){ 
      this.saving   = false
      this.modified = false
      F.clean()
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