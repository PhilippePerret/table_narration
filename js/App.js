/**
  * @module app
  */

/**
  * Sécurité pour empêcher de quitter la page quand des données n'ont pas été
  * enregistrées.
  *  
  * S'il n'y a aucune modification en cours, on sauve la configuration courante des
  * fiche pour récupérer le même état au relancement de l'application. Noter cependant
  * que si un “flash” d'une configuration a déjà été demandé, on ne procède pas
  * à l'enregistrement de la configuration.
  *
  * @method confirmExit
  * @param  {Event} Event beforeUnload généré.
  * @return Rien si la collection n'a pas été modifiée ou le texte à afficher
  *         pour confirmer de quitter la page. Mais à cause d'un bug de Firefox,
  *         ce texte ne s'affiche pas.
  * 
  */
function confirmExit(evt)
{
  if(Collection.modified)
  {
    evt.returnValue = "Veux-tu vraiment quitter ?"
    return "Veux-tu vraiment quitter ?"
  }
  else
  {
    // Ce n'est pas bon, apparemment, de faire ça. Ça produit une erreur, 
    // certainement parce qu'on lance une requête ajax en quittant la page
    // if(false == (App.flashed || MODE_TEST)) App.save_current_configuration(forcer = false)
  }
}
window.onbeforeunload = confirmExit

/**
  *	Pour la gestion de l'application
  *
  * @class App
  * @static
  *
  */
window.App = window.App || {}
$.extend(window.App, {
  
  /**
    * Clipboard (mémoire tampon) de l'application. Pour placer du texte qui 
    * devra ensuite être inséré dans le texte à l'aide de CMD+V.
    * Notes
    * -----
    *   * La valeur est soit un {String} à copier tel quel dans le texte, soit
    *     un {Object} qui doit obligatoirement répondre à la méthode `.to_balise`
    *     qui doit retourner le texte à coller dans le texte.
    *   * Utilisé par exemple pour les références
    *   * C'est la pseudo-méthode `App.coller_clipboard` qui répond au CMD+V
    *
    * @property clipboard
    * @type     {Object|String}
    * @default  null
    */
  clipboard:null,
  
  /**
    * Mis à TRUE si un flash de la configuration courante a été demandé. Pour 
    * empêcher d'en enregistrer un nouveau à la fermeture de la collection.
    * Noter cependant que de toute façon, il sera impossible d'enregistrer la 
    * configuration courante si un fichier de configuration (qui est supprimé à
    * chaque chargement) se trouve déjà créé (par un flash).
    *
    * @property flashed
    * @type     {Boolean}
    * @default  false
    */
  flashed:false,
  
  /**
    * Préférences de l'application
    *
    * Préférences
    * -----------
    *   * snap    Si true, les fiches sont disposées sur la grille
    *
    * Notes
    * -----
    *   * Cf. l'objet {Prefs} qui gère ces préférences
    *
    * @property preferences
    * @type     {Object}
    * @static
    * @default Les préférences par défaut
    */
  preferences:{
    snap        : true,   // place les fiches sur la grille
    autosave    : false,  // sauvegarde automatique
    saveconfig  : false,  // sauvegarde de la config à chaque sauvegarde
    gridbook    : false,  // Alignement des livres (orientation dépend de dirgridbook)
    dirgridbook : null,   // Orientation de l'alignement des livres ("v" ou "h"),
    showinfos   : false   // Si true affiche le type et l'id de la fiche courante
  },
  
  
  /**
    * Enregistre la configuration d'ouverture (et de rangement) actuelle pour
    * la replacer au prochain chargement de l'application.
    * 
    * NOTES
    * -----
    *   * La méthode est appelée à chaque sauvegarde si les préférences l'exigent.
    *   * Envoi la requête Ajax pour créer le fichier "current_config.config"
    *   * Si une méthode doit suivre, renseigner avec cette méthode (proxy)
    *     `App.save_current_configuration.poursuivre`
    *
    * @method save_current_configuration
    * @async
    *
    * @param  forcer  {Boolean} Si TRUE (quand appelé depuis l'appareil photo),
    *                 on force la destruction du fichier configuration pour prendre
    *                 cette nouvelle configuration.
    * @param  rajax   {Object} Retourn de la requête ajax. Donc indéfini à l'appel
    *                 de la méthode.
    * 
    */
  save_current_configuration:function(forcer, rajax)
  {
    if(undefined == rajax)
    {
      Ajax.send(
        {script:'app/save_config', collection:Collection.name,
        config:this.current_config, force:forcer},
        $.proxy(this.save_current_configuration, this, forcer)
      )
    }
    else
    {
      if(rajax.ok)
      { 
        this.flashed = true
        if('function'==typeof this.save_current_configuration.poursuivre) this.save_current_configuration.poursuivre()
        else F.show("Configuration courante enregistrée. Elle sera utilisée au prochain chargement de la table.")
      }
      else F.error(rajax.message)
    }
  },  
  
  // Jouer 'App.ajax()' pour voir si le script ajax fonctionne
  ajax:function()
  {
    Ajax.send({
      script:"app/test_ajax",
      collection:Collection.name,
      data:{}
    }, $.proxy(this.suite_ajax, this))
  },
  suite_ajax:function(rajax)
  {
    if(rajax.ok) alert("Tout s'est bien passé en ajax" +
    "\n\nRuby version: " + rajax.ruby_version)
  }
})

Object.defineProperties(App,{
  
  /**
    * Insert dans le texte le contenu du clipboard s'il n'est pas null.
    * S'il est null, renvoie FALSE pour que CMD+V agisse par défaut.
    * Notes
    * -----
    *   * Le App.clipboard est vidé dès qu'il est collé pour ne pas parasiter le
    *     comportement normal du coller-copier.
    *   * C'est une propriété complexe, donc l'appeler sans parenthèses.
    *   * Le `clipboard` peut être soit un simple {String} soit un {Object} répondant
    *     à la méthode `.to_balise` (comme les références).
    *
    * @method coller_clipboard
    *
    */
  "coller_clipboard":{
    get:function(){
      dlog("-> App.coller_clipboard", DB_FCT_ENTER)
      if(this.clipboard == null) return false
      var clip ;
      if('string'==typeof this.clipboard) clip = this.clipboard.toString()
      else clip = this.clipboard.to_balise
      UI.Input.set_selection_to( clip )
      this.clipboard = null
      CHelp.adapt_with_fiche_active // pour actualiser les raccourcis actifs
      dlog("<- App.coller_clipboard", DB_FCT_ENTER)
      return true
    }
  },
  /**
    * Pour passer en mode test
    *
    * Notes
    * -----
    *   * C'est une propriété complexe, donc appeler sans parenthèses
    *   * La méthode ouvre l'application Pure-JS-Tests.
    *
    * @method mode_test
    */
  "mode_test":{
    get:function(){
      window.open('./tests.php', "pure_js_test")
      F.show("Penser à quitter le mode test en finissant, par commodité.", {keep:true})
    }
  },
  /**
    * Analyse la configuration actuelle (ouvertures et rangements) et retourne
    * un {Object} à enregistrer dans le fichier de configuration courante.
    *
    * NOTES
    * -----
    *   * Pour procéder, cette propriété/méthode regarde simplement les fiches
    *     qui sont on_table sur la table.
    *
    * @property current_config
    * @return   {Object} Configuration courante, contenant `on_table', les fiches
    *           actuellement on_table (sur la table) et `openeds', les fiches
    *           actuellement ouvertes (opened = true)
    *
    */
  "current_config":{
    get:function(){
      var config = {
        openeds     : [],
        on_table    : [],
        orphelines  : []
      }
      /* Pour écarter certaines erreurs, je tiens à jour une table des
       * fiches traitées. Ça évitera d'enregistrer deux fois une même fiche
       * comme ouverte.
       */
      var table_fiches_traited = {}
      $('section#table > fiche:visible').each(function(){
        var fiche = FICHES.domObj_to_fiche($(this))
        if(table_fiches_traited[fiche.id])
        {
          F.error("La fiche "+fiche.type_id+" se trouve en double sur la table…", {keep:true})
          return
        }
        else
        {
          table_fiches_traited[fiche.id] = true
        }
        var datam = {id:fiche.id, type:fiche.type}
        config.on_table.push(datam)
        if(fiche.opened) config.openeds.push(datam)
        if(fiche.is_not_book && fiche.is_orpheline) config.orphelines.push(datam)
      })
      return JSON.stringify(config)
    }
  },
  
  /**
    * Applique la configuration courante. En d'autres termes, ouvre les fiches qui
    * doivent être ouvertes (en les sortant de leur parent si nécessaire).
    *
    * @method current_configuration
    *
    */
  "current_configuration":{
    set:function(conf){
      this._current_configuration = conf
      if(conf == null) return
      var errors = [], fiche ;
      // On ouvre les fiches qui doivent l'être
      // @note : c'est une procédure qui ne doit pas être asynchrone, car tous
      // les éléments nécessaire ont dû être remontés.
      L(conf.openeds).each(function(fdata){
        if(undefined == FICHES.list[fdata.id]) errors.push("La fiche #"+fdata.id+" devrait exister…")
        else
        {
          fiche = get_fiche(fdata.id)
          // Si c'est une page, et que son livre est fermé, il faut ouvrir le livre,
          // pour afficher la table des matières, et enfin ouvrir la page.
          if(fiche.is_page && fiche.book && fiche.book.closed)
          {
            fiche.book.open
            refermer_book = true
          } 
          else refermer_book = false
          fiche.open
          if(refermer_book) fiche.book.close
        } 
      })
      // Juste pour voir, on regarde si les fiches visibles sont bien visibles
      L(conf.on_table).each(function(fdata){
        if($('section#table > fiche#f-'+fdata.id).length == 0) errors.push("La fiche #"+fdata.id+" devrait être visible.")
      })
      if(errors.length)
      {
        F.error(LOCALE.app.error['current config error']+errors.join("\n\t"))
      }
    }
  }
  
})