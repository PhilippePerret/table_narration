/**
  * Gestion des préférences de l'application.
  *
  * @module     app
  * @submodule  app-prefs
  * @main       App
  */
window.App = window.App || {}
App.Prefs = {
  
  /**
    * Indique si le panneau des préférences est prêt à être affiché (construit)
    * @property prepared
    * @default  false
    */
  prepared:false,
  
  /**
    * Données pour construire le panneau des préférences
    *
    * @property DATA
    * @type {Array}
    * @static
    */
  DATA:[
    /* L'id doit correspondre à celui dans App.preferences */
    {id:'general',    type:'fieldset',  legend:"Générales"},
    {id:'autosave',   type:'cb',        label:"Sauvegarde automatique"},
    {id:'saveconfig', type:'cb',        label:"Sauver la configuration des fiches à chaque sauvegarde"},
    {id:'general',    type:'/fieldset'},
    {id:'fiches',     type:'fieldset',  legend:"Fiches"},
    {id:'snap',       type:'cb',        label:"Aligner les fiches sur la grille"},
    {id:'fiches',     type:'/fieldset'}
    ],
  
  /**
    * Enregistre les préférences de l'application (et reçoit le retour de la 
    * requête ajax)
    *
    * Notes
    * -----
    *   * Les préférences sont définies dans {App.preferences}
    *
    * @method save
    * @param  {Object} rajax    Retour de la requête Ajax (if any)
    * @for    App.Prefs
    */
  save:function(rajax)
  {
    if(undefined == rajax)
    {
      this.get_values
      Ajax.send(
        {script:'app/save_preferences', preferences:App.preferences},
        $.proxy(this.save, this)
      )
    }
    else
    {
      if(rajax.ok)
      {
        F.show("Préférences enregistrées.")
        this.close()
      } 
      else F.error(rajax.message)
    }
  },
  
  /**
    * Ouvre le panneau des préférences
    *
    * Notes
    * -----
    *   * C'est la méthode principale à appeler. Elle se charge de construire le
    *     panneau des préférences si nécessaire.
    *
    * @method show
    * 
    */
  show:function()
  {
    if(!this.prepared) this.prepare_panneau
    this.panneau.show()
  },
  
  /**
    * Ferme le panneau des préférences
    *
    * @method close
    */
  close:function()
  {
    this.panneau.hide()
  }
  
  
}

Object.defineProperties(App.Prefs, {
  
  /**
    * Objet DOM du panneau ({jQuerySet})
    * @property panneau
    * @type {jQuerySet}
    */
  "panneau":{
    get:function(){
      return $('div#preferences')
    }
  },
  
  /**
    * Récupère les valeurs des préférences dans le panneau et les met
    * dans App.preferences
    *
    * @method get_values (complexe)
    *
    */
  "get_values":{
    get:function(){
      var id, obj ;
      L(this.DATA).each(function(data){
        id  = data.id
        obj = $('input#pref-'+id)
        if(obj.length == 0) return
        switch(data.type)
        {
        case 'cb':
          App.preferences[id] = obj[0].checked == true
          if(id=='autosave')
          {
            $('input#cb_automatic_save')[0].checked = App.preferences[id]
            Collection.enable_automatic_saving(App.preferences[id])
          }

          break
        }
      })
    }
  },
  
  /**
    * Prépare le panneau des préférences
    * Notes
    * -----
    *   * C'est une propriété complexe, donc l'appeler sans parenthèses
    *
    * @method prepare_panneau
    */
  "prepare_panneau":{
    get:function(){
      $('body').append(this.html_panneau)
      // On met les valeurs par défaut
      var id, obj ;
      L(this.DATA).each(function(data){
        id = data.id
        obj = $('input#pref-'+id)
        switch(data.type)
        {
        case 'cb':
          obj[0].checked = App.preferences[id]
          break
        }
      })
      this.prepared = true
    }
  },
  
  /**
    * Retourne le code HTML du panneau de préférences
    *
    * Notes
    * -----
    *   * Cf. le fichier de style `./css/ui/preferences.css` pour l'aspect
    *
    * @method html_panneau (complexe)
    * @return {HTML} Code à insérer dans le body.
    */
  "html_panneau":{
    get:function(){
      return  '<div id="preferences">'+
                '<div class="titre">Préférences</div>'+
                this.html_options +
                this.html_buttons +
              '</div>'
    }
  },
  /**
    * Retourne le code HTML pour la liste des options des préférences
    *
    * @method liste_options
    * @return {HTML} Code à insérer dans le panneau des préférences
    */
  "html_options":{
    get:function(){
      var code = ""
      L(this.DATA).each(function(data){
        var id = data.id
        switch(data.type)
        {
        case 'cb':
          code += '<div class="div_cb_pref">'+
                    '<input type="checkbox" id="pref-'+id+'" />'+
                    '<label for="pref-'+id+'">'+data.label+'</label>'+
                  '</div>'
          break
        case 'fieldset':
          code += '<fieldset id="prefs-'+id+'"><legend>'+data.legend+'</legend>'
          break
        case '/fieldset':
          code += '</fieldset>'
          break
        }
      })
      return code
    }
  },
  
  /**
    * Retourne le code HTML pour les boutons du bas
    *
    * @method html_buttons
    * @return {HTML} Code des boutons dans leur div
    */
  "html_buttons":{
    get:function(){
      return  '<div class="buttons">'+
                '<input type="button" value="Renoncer" class="fleft" onclick="$.proxy(App.Prefs.close, App.Prefs)()" />' +
                '<input type="button" value="Enregistrer" onclick="$.proxy(App.Prefs.save, App.Prefs)()" />' +
              '</div>'
    }
  }
})