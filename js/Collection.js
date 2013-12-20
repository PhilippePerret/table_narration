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
window.Collection = window.Collection || {}
$.extend(Collection, {
  /*
   *  CONSTANTES
   *  
   */
  
  /**
    * Nom de la collection courante (nom du dossier dans `./collection`)
    *
    * @property {String} name
    * @static
    * @default  null
    */
  name:null,
  
  /**
    * Fréquence de sauvegarde en mode de sauvegarde automatique.
    * @property {Number} frequence_saving
    * @static
    */
  frequence_saving: 20 * 1000, // 5*1000
    
  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  /** 
    * Indique que la sauvegarde est en cours
    * @property {Boolean} saving
    * @default  false
    */
  saving        : false,
  /** 
    * Indique que le chargement est en cours
    * @property {Boolean} loading
    * @default  false
    */
  loading       : false,
  
  /** 
    * Indique que la collection est chargée
    * @property {Boolean} loaded
    * @default  false
    */
  loaded        : false,
  
  /**
    * Liste des livres de la collection (liste d'instances {Book})
    *
    * NOTES
    * -----
    * Cette liste est établie au chargement de la collection en insérant
    * toutes les fiches de type {Book}. C'est la méthode FICHES.dispatch qui
    * s'en charge.
    *
    * @property {Array} books
    * @default  []
    */
  books:[],
  
  /**
    * Permet de choisir la collection à afficher.
    *
    * Notes
    * -----
    *   * Pour le moment, il y a trois collections possibles : la collection
    *     "narration" (pour laquelle a été créée cette app), la collection "test"
    *     qui permet de faire les tests unitaires et d'intégration et la collection
    *     "publishing" qui permet de faire les tests de publication.
    *   * La méthode produit une alerte si des éléments modifiés n'ont pas été
    *     enregistrés.
    *   * La méthode initialise tout avant de charger (Collection.clear).
    *   * Si on n'est pas en mode test, un backup est lancé à la fin du chargement.
    *
    * @method choose
    * @async
    *
    * @param  {String} name   Le nom de la collection à charger.
    * @param  {Boolean} confirmed Lorsque des éléments étaient modifiés, la fonction
    *                   a demandé confirmation. Le résultat de la confirmation, lorsqu'il
    *                   est positif, est renvoyé par cet argument.
    *
    * @return {Boolean} True si le chargement de la collection a été lancé. False sinon.
    *
    */
  choose:function(name, confirmed)
  {
    if(undefined == confirmed && this.modified) return this.confirm_load($.proxy(this.choose, this, name))
    this.clear
    Ajax.send({script:"collection/load", collection_name:name}, $.proxy(this.retour_load, this))
    return true
  },
  
  
  /**
    * Retour du chargement de la collection
    * -------------------------------------
    *
    * Notes
    * -----
    *   * Cette méthode produit :
    *     * Dispatch des informations
    *     * Construction de la collection
    *     * Lancement d'un backup (sauf en mode test)
    *     * Préparation de l'interface utilisateur
    *
    * @method retour_load
    * @param  {Object} rajax  Le retour ajax de la méthode load.
    *
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
    window.MODE_TEST = (this.name == 'test')
    if(MODE_TEST){ 
      F.show("Penser à quitter le mode test en finissant, par commodité.", {keep:true})
    }
    window.ready = true
    if( rajax.paragraph_styles_updated ) F.show("La liste des styles de paragraphe a été updatée.")
    if(!MODE_TEST) this.backup
  },
  
  // Noter que ce retour n'est utilisé que lorsqu'on force un backup
  // différent du backup quotidien.
  retour_force_backup:function(rajax)
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
      
  /**
    * Méthode qui dispatche toutes les données +data+ remontées par
    * la requête ajax `collection/load`.
    *
    * Notes
    * -----
    *   * Il s'agit de dispatcher :
    *       * Les fiches (et d'afficher/ouvrir celles qui doivent l'être)
    *       * Les données de l'application courante (comme le nom de la collection)
    *       * Les préférences de l'application
    * 
    * WARNING
    * -------
    * Cette méthode ne doit pas être utilisée pour charger seulement une
    * portion de la collection en cours de travail, car elle ré-initialise la
    * liste des modifications en fin de dispatch (car la création des fiches
    * les a marquées modifiées).
    * En d'autres termes, si des fiches sont chargées en groupe plus tard, il
    * faut passer par FICHES.dispatch (TODO: mais n'est-ce pas le même problème ?
    * et ne vaudrait-il pas mieux gérer la marque de la modification de la fiche ?)
    *
    * @method dispatch
    * @param  {Object} data Toutes les données remontées par ajax.
    *
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
  
  /**
    * Dispatch les données remontées au chargement (en dehors des données fiches)
    * 
    * Notes
    * -----
    *   * Il s'agit des données :
    *     * Le dernier identifiant de fiche utilisé.
    *     * Le nom de la collection courante
    *     * La configuration courante (ouverte/visibilité des fiches)
    *     * Les préférences de l'application.
    *     * Au premier chargement, définit aussi `collections`, la liste
    *       des noms des collections courantes, pour établir le menu qui 
    *       permettra de passer de l'une à l'autre.
    *
    * @method dispatch_data
    * @param  {Object} data   La table des données à dispatcher
    */
  dispatch_data:function(data)
  {
    FICHES.last_id = parseInt(data.last_id_fiche, 10)
    this.name = data.collection_name
    if(data.preferences) App.preferences = data.preferences
    if(data.collections) UI.peuple_menu_collections(data.collections)
    // Configuration courante (note: le fait de la définir l'applique)
    App.current_configuration = data.current_configuration
  },
  
  /**
    * Demande confirmation avant de charger une nouvelle collection, quand des
    * éléments n'ont pas été sauvés (this.modified est true).
    *
    * Notes
    * -----
    *   * La méthode utilise `UI.confirm`.
    *   * Elle est considérée comme asynchrone puisque la méthode UI.confirm l'est.
    *
    * @method confirm_load
    * @async
    * @param  {Function} poursuivre La méthode pour suivre.
    *
    */
  confirm_load:function(poursuivre){
    UI.confirm(
      LOCALE.collection.ask['things not save']+LOCALE.collection.ask['follow though'],
      poursuivre, undefined,
      {ok_name:"Ignorer les changements"}
    )
  }
  
  
})

Object.defineProperties(Collection,{
  
  /**
    * Efface complètement la collection courante (avant chargement d'une autre
    * collection)
    *
    * @method clear (sans parenthèses)
    *
    */
  "clear":{
    get:function(){
      FICHES.init_all
    }
  },
  
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
        $.proxy(this.save, this), this.frequence_saving
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
   *    :: La méthode `save` est appelée dès qu'on active le bouton
   *  
   */
  "enable_automatic_saving":{
    value:function(oui){
      this.AUTOMATIC_SAVING = oui
      if(oui){ 
        this.start_automatic_saving
        if(this.loaded) this.save()
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
      window.ready  = false
      this.loading  = true
      stop_save
      F.show("Chargement de la collection…", {timer:false})
      Ajax.send({script:'collection/load'}, $.proxy(this.retour_load, this))
    }
    
  },
  
  /**
    * Retourne FALSE si quelque chose doit être sauvé (fiches, etc.)
    *
    * Notes
    * -----
    *   * La méthode est appelée par Collection.save()
    *
    * @method nothing_to_save (sans parenthèses)
    * @return FALSE si des choses sont à enregistrer, TRUE dans le cas contraire.
    */
  "nothing_to_save":{
    get:function(){
      if(this.modified === true)
      {
        return false
      }
      else
      {
        return true
      }
    }
  },
  
  /**
    * Sauvegarde de tous les éléments de la collection
    * (fiches, configuration, etc.)
    * 
    * NOTES
    * -----
    *   * Les fiches à sauvegarder (ou supprimer) sont contenues dans la liste
    *     this.modifieds_list (sous forme d'instances)
    *   * C'est la méthode `nothing_to_save` qui est appelée en premier
    *     lieu pour voir si un enregistrement est nécessaire.
    *   * La méthode lance une "chaine de sauvegarde" appelant `save_fiches`,
    *     `save_config`, etc. jusqu'à `save_end`
    *
    * @method save
    * @async
    * @return TRUE si quelque chose est en train d'être sauvé. FALSE dans le
    *         cas contraire.
    */
  "save":{
    value:function(){
      if(this.nothing_to_save) return false
      this.saving = true
      dlog("Sauvegarde de la collection", DB_SIMPLE)
      F.show("Sauvegarde en cours…", {no_timer:true})
      this.save_fiches
      return true
    }
  },
  /* Sauvegarde des fiches */
  "save_fiches":{
    get:function(){
      // console.log("---> Collection.save_fiches")
      FICHES.save( $.proxy(this.save_config, this ) )
    }
  },
  /**
    * Demande de la sauvegarde de la configuration courante
    * Notes
    * -----
    *   * Seulement si les préférences le réclament
    * @method save_config
    */
  "save_config":{
    value:function(){
      if(App.preferences.saveconfig)
      {
        App.save_current_configuration.poursuivre = $.proxy(this.end_save, this )
        App.save_current_configuration(forcer = true)
      }
      else this.end_save()
    }
  },
  /**
    * Fin de la sauvegarde générale
    * @method end_save
    */
  "end_save":{
    value:function(){ 
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
  
  /**
    * Lance le backup journalier
    * Notes
    * -----
    *   * Cette procédure est lancée tout de suite après le chargement de la
    *     collection courante (sauf en mode test).
    *   * C'est une pseudo-méthode, donc à appeler sans parenthèses.
    *
    * @method backup
    */
  "backup":{
    get:function(){
      Ajax.send({script:'collection/backup'},$.proxy)
    }
  },
  /**
    * Retour du backup quotidien
    * Notes
    * -----
    *   * Même si c'est un backup quotidien unique, il est appelé à chaque
    *     chargement de l'application.
    *   * En mode normal (non test), c'est cette méthode qui définit que 
    *     l'application est prête à travailler (`window.ready`)
    *
    * @method retour_backup
    *
    */
  "retour_backup":{
    value:function(rajax){
      if(rajax.ok) window.ready = true
      else F.error( rajax.message )
    }
  },
  /*
   *  Force un nouveau backup (avec l'heure)
   *  
   *  Sauf en mode test
   *
   */
  "force_backup":{
    get:function(){
      Ajax.send({script:'collection/backup', force_backup:1}, $.proxy(this.retour_force_backup,this))
    }
  }
  
})