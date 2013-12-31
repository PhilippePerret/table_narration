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
    {id:'autosave',   type:'cb',        label:"Sauvegarde automatique", indiv:true},
    {id:'saveconfig', type:'cb',        label:"Sauver la configuration des fiches à chaque sauvegarde", indiv:true},
    {id:'general',    type:'/fieldset'},
    {id:'fiches',     type:'fieldset',  legend:"Fiches"},
    {id:'snap',       type:'cb',        label:"Aligner les fiches sur la grille", indiv:true},
    {id:'showinfos',  type:'cb',        label:"Afficher type:id dans pied de page", indiv:true},
    '<div>',
    {id:'gridbook',   type:'cb',        label:"Livre rangés " , onchange:"$.proxy(App.Prefs.onchange_livre_ranged,App.Prefs,this.checked)()"},
    {id:'dirgridbook',type:'select', style:"visibility:hidden;",
      values:[{value:"h",title:"horizontalement"}, {value:"v",title:"verticalement"}]},
    '</div>',
    {id:'fiches',     type:'/fieldset'},
    {id:'paragraphes', type:'fieldset', legend:"Paragraphes"},
    {id:'masknotprinted', type:'cb',    label:"Masquer paragraphe “not printed”", indiv:true, 
      onchange:"$.proxy(App.Prefs.onchange_masknotprinted, App.Prefs, this.checked)()"},
    {id:'paragraphes', type:'/fieldset'}
    ],
  
  /**
    * Méthode appelée quand on clique sur le cb "livre rangés"
    * La méthode affiche ou masque le menu pour choisir l'alignement des livres,
    * horizontal ou vertical.
    * @method onchange_livre_ranged
    * @param  {Boolean} coched    Etat du coche de la cb
    */
  onchange_livre_ranged:function(coched)
  {
    $('select#pref-dirgridbook').css('visibility', coched?'visible':'hidden')
  }, 
  
  /**
    * Méthode appelée quand on clique sur la CB pour masquer/afficher les 
    * paragraphes "not printed"
    * Elle passe en revue les pages ouvertes (elle doit les trouver sur la
    * table) et masque ou montre les paragraphes not printed.
    * @method onchange_masknotprinted
    * @param {Boolean} masquer Si TRUE, on doit les masquer
    */
  onchange_masknotprinted:function(masquer)
  {
    $('section#table > fiche.page').each(function(){
      fiche = fiche_of_obj($(this))
      if(fiche.enfants)
      {
        L(fiche.enfants).each(function(child){
          child.applique_filtre
        })
      }
    })
  },
  
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
        {
          script:'app/save_preferences', 
          collection:Collection.name,
          preferences:App.preferences},
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
        if('string'==typeof data) return
        id  = data.id
        switch(data.type)
        {
        case 'cb':
          obj = $('input#pref-'+id)
          App.preferences[id] = obj[0].checked == true
          if(id=='autosave')
          {
            $('input#cb_automatic_save')[0].checked = App.preferences[id]
            Collection.enable_automatic_saving(App.preferences[id])
          }
          else if(id=='gridbook' && App.preferences[id])
          { //=> il faut aligner les livres
            UI.align_books($('select#pref-dirgridbook').val())
          }
          break
        // Ne rien faire avec ces types :
        case 'fieldset':
        case '/fieldset':
          break
        default:
          obj = $(data.type+'#pref-'+id)
          App.preferences[id] = obj.val()
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
        if('string'==typeof data) return
        id = data.id
        switch(data.type)
        {
        case 'cb':
          obj = $('input#pref-'+id)
          obj[0].checked = App.preferences[id]
          break
        // Ne rien faire avec ces types :
        case 'fieldset':
        case '/fieldset':
          break
        default:
          obj = $(data.type+'#pref-'+id)
          obj.val(App.preferences[id])
        }
      })
      
      // Quelques traitements spéciaux
      this.onchange_livre_ranged(App.preferences['gridbook'])
      
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
        if('string' == typeof data)
        {
          code += data
          return
        }
        
        
        var id = data.id
        // Pour préparer les attributs de la balise d'ouverture
        var attrs = {id:"pref-"+id}
        if(data.onclick)  attrs.onclick   = data.onclick
        if(data.onchange) attrs.onchange  = data.onchange
        if(data.class)    attrs.class     = data.class
        if(data.style)    attrs.style     = data.style
        
        switch(data.type)
        {
        case 'cb':
          attrs.type = "checkbox"
          if(data.indiv) code += '<div class="div_cb_pref">'
          code += "input".to_tag(attrs) +
                    '<label for="pref-'+id+'">'+data.label+'</label>'
          if(data.indiv) code += '</div>'
          break
        case 'select':
          code += "select".to_tag(attrs) +
          L(data.values).collect(function(d){
            return '<option value="'+d.value+'">'+d.title+'</option>'
          }).join("")+'</select>'
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