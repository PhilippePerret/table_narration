/**
  * @module App.js
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
    if(false == App.flashed) App.save_current_configuration(forcer = false)
  }
}
window.onbeforeunload = confirmExit

/**
  *	Objet App, pour la gestion de l'application
  *
  * @class App
  * @static
  *
  */
window.App = {
	
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
    * Enregistre la configuration d'ouverture (et de rangement) actuelle pour
    * la replacer au prochain chargement de l'application.
    * 
    * NOTES
    * -----
    *
    *   * Envoi la requête Ajax pour créer le fichier "current_config.config"
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
        {script:'app/save_config', config:this.current_config, force:forcer},
        $.proxy(this.save_current_configuration, forcer, this)
      )
    }
    else
    {
      if(rajax.ok)
      { 
        this.flashed = true
        F.show("Configuration courante enregistrée. Elle sera utilisée au prochain chargement de la table.")
      }
      else F.error(rajax.message)
    }
  },
  
  // Pour lancer le test de l'application
  // 
  // @note: la méthode lance aussi un appel à un script ajax 
  // qui va mettre de côté la collection actuelle pour ne pas y 
  // toucher pendant les tests
	test:function()
	{
    window.open("./tests.php", 'pure-javascript-test')
    Ajax.send({script:"tests/mode_test"}, $.proxy(this.suite_test, this))
	},
  suite_test:function(rajax)
  {
    if(rajax.ok)
    {
      F.show("Cliquer sur le bouton “-> Mode normal” pour revenir à la collection originale"+
      "\n\nDossier courant : " + rajax.current_folder, {keep:true})
      Collection.load
      $('input#btn_test').hide()
      $('input#btn_collection_originale').show()
    }
    else
    {
      F.error(rajax.message)
    }
  },
  
  // Repasser en mode normal (ce qui aura surtout pour effet de remettre le
  // dossier collection courante)
  mode_normal:function()
  {
    Ajax.send({script:"tests/mode_normal"}, $.proxy(this.suite_mode_normal,this))
  },
  suite_mode_normal:function(rajax)
  {
    if(rajax.ok)
    {
      F.show("Retour au mode normal. Rechargement de la collection en cours."+
      "\n\nDossier courant : " + rajax.current_folder, {keep:true})
      Collection.load
      $('input#btn_test').show()
      $('input#btn_collection_originale').hide()
    }
    else
    {
      F.error(rajax.message)
    }
  },
  
  
  // Jouer 'App.ajax()' pour voir si le script ajax fonctionne
  ajax:function()
  {
    Ajax.send({
      script:"app/test_ajax",
      data:{}
    }, $.proxy(this.suite_ajax, this))
  },
  suite_ajax:function(rajax)
  {
    if(rajax.ok) alert("Tout s'est bien passé en ajax" +
    "\n\nRuby version: " + rajax.ruby_version)
  }
}

Object.defineProperties(App,{
  
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