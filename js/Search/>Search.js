/**
  * Module pour l'objet Search qui permet de faire des recherches dans 
  * tous les textes de la collection.
  *
  * @module Search.js
  * @class Search
  * @static
  *
  */
window.Search = window.Search || {}
$.extend(window.Search,{

  /** Indique l'état de préparation du panneau Search (div#search). Si true,
    * le panneau est construit
    * @property {Boolean} prepared 
    * @default false
    */
  prepared:false,
  /** Indique l'état de préparation du formulaire. Si True, le formulaire
    * a été construit.
    * @property {Boolean} form_prepared
    * @default  false
    */
  form_prepared:false,
  /** Indique l'état de préparation du panneau de résultat
    * Si true, le panneau de résultat est prêt et peut être peuplé.
    * @property {Boolean} panneau_result_prepared
    * @default false
    */
  panneau_result_prepared:false,
  
  
  
  /** Fermer le panneau de recherche
    * @method hide
    */
  hide:function()
  {
    this.panneau.hide()
    UI.Input.retreive_current({focus:true})
  },
  /**
    * Bascule entre le panneau de résultat et le formulaire de recherche
    * @method toggle
    */
  toggle:function()
  {
    this.hide_result()
    this.show_form()
  },
  /** Affiche le formulaire de recherche
    * C'est la méthode principale appelée pour afficher le formulaire de recherche,
    * lorsqu'on clique par exemple sur le bouton zoom
    *
    * @method show_form
    */
  show_form:function()
  {
    UI.Input.memorize_current({blur:true, keypress:null})
    this.panneau.show()
    this.form.show()
  },
  /** Masque le formulaire de recherche
    * @method hide_form
    */
  hide_form:function()
  {
    this.form.hide()
  },
  
  /** Affiche le panneau de résultat
    * @method show_result
    * @param  {Boolean} clean Si True, la liste de résultat est effacée
    */
  show_result:function(clean)
  {
    this.panneau.show()
    this.panneau_result.show()
    if(clean == true) $('div#search div#search_result_list').html('')
  },
  /** Masque le panneau de résultat
    * @method hide_result
    */
  hide_result:function()
  {
    this.panneau_result.hide()
  },
  /**
    * = Main = Fonction principale pour invoquer une recherche
    *
    * Notes
    * -----
    *   * Cette méthode peut être utilisée par le raccourci `find(...)` défini
    *     en bas de ce module.
    *   * C'est cette méthode qui est appelée par le bouton “Rechercher” dans le
    *     formulaire de recherche.
    *
    * @method find
    * @async
    * @param  {String|Regexp} text  Le texte à chercher exprimé en raw text ou
    *                         comme une expression régulière 
    * @param  {Object}        params  Les paramètres optionnels de la recherche
    * 
    * @example
    *   Search.text("Ce texte à chercher")
    *   Search.text(/(un|des) textes?/)
    */
  find:function(text, params)
  {
     // Envoyer la requête
     F.show("Recherche en cours…")
     Ajax.send(
       {script:'fiche/search', params:$.extend(params, {search_text:text})},
       $.proxy(this.found, this)
     )
  },
  /**
    * Méthode appelée par le bouton "Rechercher" du formulaire.
    * Elle rassemble les paramètres de la recherche et invoque la méthode `find`
    * pour effectuer cette recherche. Le rassemblement de ces paramètres se fait
    * de façon assez simple en bouclant sur tous les éléments DOM de class "param_search"
    * et en relevant leur valeur (seulement s'ils sont cochés pour les CB)
    * @method proceed
    * @async
    */
  proceed:function()
  {
    var text    = $('div#search input#search_text').val().trim()
    var params  = {}
    $('div#search_form .param_search').each(function(){
      var dom = $(this)[0]
      if(dom.tagName == 'INPUT' && dom.type == "checkbox")
      {
        if(dom.checked) params[dom.value] = true
      }
      else
      {
        params[$(this).attr('data-param')] = dom.value
      }
    })
    dlog("params:");dlog(params)
    this.find(text, params)
  },
  /**
    * Retour ajax de la requête de recherche (find)
    * @method found
    * @param  {Object} rajax  Objet retourné par la requête Ajax
    *   @param  {Boolean}   rajax.ok    True si la requête s'est bien passée
    *   @param  {String}    rajax.message Le message de retour ou l'erreur
    *   @param  {Object}    rajax.found   Objet contenant le résultat de la recherche
    */
  found:function(rajax)
  {
    if(rajax.ok)
    { 
      F.clean()
      this.display_found(rajax.found)
    }
    else F.error(rajax.message)
  },
  
  /**
    * Traitement du résultat de la recherche remontée par ajax
    * C'est la méthode principale qui affiche le résultat, c'est-à-dire les textes et
    * les fiches retenues.
    *
    * @method display_found
    * @param  {Object} data Donnée du résultat de la recherche
    */
  display_found:function(data)
  {
    this.hide_form()
    this.show_result(purge=true)
    $('div#search div#search_result_list').scrollTo(0,0)
    if(data.nombre_founds == 0)
    {
      this.write("Aucun résultat trouvé pour la recherche donnée.", {class:'warning'})
    }
    else
    {
      this.write("Nombre de résultats : " + data.nombre_founds, {class:'bold'})
    }
    this.write('<div style="small">',{raw:true})
    this.write("Nombre fiches étudiées : " + data.nombre_fiches_etudiees)
    this.write("Nombre fiches rejetées : " + data.nombre_rejecteds)
    this.write('</div><hr />',{raw:true})
    
    /*
     * On affiche le listing des fiches contenues dans data.founds
     */ 
    var me = this
    L(data.founds).each(function(dfound){
      me.write(me.html_founded_text(dfound, {class:'found'}))
    })
  },
  /**
    * Retourne le code HTML à écrire dans la liste des résultats
    *
    * @method html_founded_text
    * @param  {Object} dfound   Objet de la donnée trouvé dans la fiche
    *   @param  {String}  dfound.id       Identifiant de la fiche
    *   @param  {String}  dfound.type     Type de la fiche
    *   @param  {String}  dfound.incipit  N premiers caractères
    *   @param  {Array}   dfound.matches  
    *                     Tous les textes trouvés, où chaque élément
    *                     est un {Hash} contenant :
    *                     @param  {String}  pre     N caractères avant le texte trouvé
    *                     @param  {String}  post    N caractères après le texte trouvé
    *                     @param  {String}  found   Le texte trouvé
    *                     @param  {Number}  :offset L'offset du texte trouvé
    * @return {String} Le code HTML construit
    */
  html_founded_text:function(dfound)
  {
    var c = this.link_to_show_fiche(dfound)
    if(dfound.matches)
    {
      // Ajouter chaque texte trouvé
      c += L(dfound.matches).collect(function(match){
        return  '<div class="subfound">'+
                  '<span class="small">'+match.pre+'</span> '+
                  '<span class="match_found">'+match.found + '</span>' +
                  ' <span class="small">'+match.post +
                  ' [offset:' + match.offset + ']</span>' +
                '</div>'
      }).join("")
    }
    return c
  },
  /**
    * Retourne le code HTML d'un <a-link> qui permettra d'afficher la fiche
    * voulue.
    * @method link_to_show_fiche
    * @param  {Object} dfound   Objet tel que remonté par la recherche (cf. ci-dessus)
    * @return {String} Le code HTML à copier dans la page
    */
  link_to_show_fiche:function(dfound)
  {
    return '<a onclick="$.proxy(FICHES.show,FICHES,'+dfound.id+',\''+dfound.type+'\')()" style="cursor:pointer;">' + 
            '[<span class="tiny">'+dfound.type+":"+dfound.id+']</span> '+
            dfound.incipit+'</a>'
  },
  /**
    * Ecrit une ligne (div) dans le panneau de résultat
    * @method write
    * @param  {String} line   La ligne à écrire (dans un DIV)
    * @param  {Object}  options   Options pour l'affichage de ce résultat
    *   @param  {String}  options.class   Class CSS pour cette ligne de résultat
    */
  write:function(line, options)
  {
    if(undefined == options) options = {}
    if(!options.raw) line = this.compose_line_result(line,options)
    $('div#search div#search_result_list').append(line)
  },
  
  /**
    * Compose la ligne de résultat à écrire
    * @method compose_line_result
    * @param  {String} line La ligne à écrire
    * @param  {Object} options    Options d'affichage (cf. write ci-dessus)
    * @return {String} La ligne de résultat à écrire
    */
  compose_line_result:function(line, options)
  {
    var tag = '<div'
    var css = ['result']
    if(options.class) css.push(options.class)
    tag += ' class="'+css.join(' ')+'"'
    tag += '>'
    return tag + line + '</div>'
  },
  
  /* ---------------------------------------------------------------------
   *  Méthodes interactives
   * ---------------------------------------------------------------------*/
  /** Méthode appelée quand on clique sur la CB "tous" pour les types de 
    * fiche. Elle décoche ou elle coche tous les types en fonction du checked
    * de la case à cocher.
    * Notes
    *   * La méthode étant appelée à la construction du formulaire pour cocher
    *     tous les types de fiche, il faut aussi traiter ici le cb "Tous"
    * @method onchange_tout_type_fiche
    * @param  {Boolean} coched  True si la case est cochée
    */
  onchange_tout_type_fiche:function(coched)
  {
    $('div#search input[type="checkbox"]#param_search-fiche_type-all')[0].checked = coched
    L(FICHES.datatype).each(function(id, dtype){
      $('input[type="checkbox"]#param_search-fiche_type-'+id)[0].checked = coched
    })
  }
})

Object.defineProperties(Search,{

  /**
    * Le panneau principal
    * @property panneau
    * @type {jQuerySet}
    */
  "panneau":{
    get:function(){
      if(!this.prepared) this.prepare_panneau
      return $('div#search')
    }
  },
  /**
    * Le formulaire de recherche
    * Notes
    *   * C'est une propriété complexe qui crée le formulaire lorsque
    *     c'est nécessaire
    * @property form
    * @type {jQuerySet}
    * @default  undefined
    */
  "form":{
    get:function(){
      if(!this.form_prepared)
      { 
        if(!this.prepared) this.prepare_panneau
        this.prepare_form
        // Pour cocher tous les types de fiche
        this.onchange_tout_type_fiche(true)
      }
      return $('div#search_form')
    }
  },
  
  "panneau_result":{
    get:function(){
      if(!this.panneau_result_prepared)
      { 
        if(!this.prepared) this.prepare_panneau
        this.prepare_panneau_result
      }
      return $('div#search_result')
    }
  },
  
  /* ---------------------------------------------------------------------
   *  Constructeurs DOM
   * --------------------------------------------------------------------- */
  /**
    * Prépare le panneau principal contenant le formulaire et le résultat
    * de la recherche
    * Notes
    *   * Propriété complexe => appeler sans parenthèses
    *
    * @method prepare_panneau
    */
  "prepare_panneau":{
    get:function(){
      $('body').append(
        '<div id="search" class="panneau">'+
        '<div id="search_form"></div>'+
        '<div id="search_result" style="display:none;"></div>'+
        '</div>'
      )
      this.prepared = true
      $('div#search input[type="text"]').unbind('keypress')
      $('div#search input[type="text"]').bind('keypress',function(evt){return true})
      $('div#search').draggable()
    }
  },
  /**
    * Prépare le formulaire de recherche et l'insert dans la page
    * Notes
    *   * Propriété complexe => appeler sans parenthèses
    * @method prepare_form
    */
  "prepare_form":{
    get:function(){
      $('div#search div#search_form').replaceWith(this.html_form)
      this.form_prepared = true
      // Réglage de certaines valeurs
      $('select#param_search-dev_min').val("0")
      $('select#param_search-dev_max').val("9")
    }
  },
  
  /**
    * Prépare le panneau pour afficher les résultats
    * Notes
    *   * Propriété complexe => appeler sans parenthèses
    * @method prepare_panneau_result
    */
  "prepare_panneau_result":{
    get:function(){
      $('div#search div#search_result').replaceWith(this.html_panneau_result)
      this.panneau_result_prepared = true
    }
  },
  
  /**
    * Retourne le code HTML pour la définition de la recherche
    * @property html_form
    * @static
    */
  "html_form":{
    get:function(){
      return  '<div id="search_form" class="panneau_search">'+
                '<div class="titre">Recherche</div>'+
                this.html_fields_form  +
                this.html_buttons_form +
              '</div>'
    }
  },
  
  /**
    * Retourne le code HTML pour le panneau de résultat
    * @property html_panneau_result
    * @type {String}
    */
  "html_panneau_result":{
    get:function(){
      return  '<div id="search_result" class="panneau_search">'+
                '<div class="titre">Résultat de la recherche</div>'+
                this.html_fields_result +
                this.html_buttons_result +
              '</div>'
    }
  },
  /** Retourne le code HTML des champs du formulaire de recherche
    * @property {String} html_fields_form
    * @static
    * Traitement/Options à ajouter
    *   * Chercher seulement dans les fiches chargées (option très spéciale)
    *   * ptype des paragraphes
    */
  "html_fields_form":{
    get:function(){
      return  '<div class="fields">'+
                '<input id="search_text" type="text" placeholder="Expression à rechercher" />' +
                this.fieldset_params  +
                this.fieldset_options +
                this.fieldset_retour  +
              '</div>'
    }
  },
  /** Retourne le code HTML pour le fieldset des paramètres de recherche
    * @property {String} fieldset_params
    */
  "fieldset_params":{
    get:function(){
      var c = ""
      
      c += '<fieldset id="search_form_fs_typefiches"><legend>Chercher dans type…</legend>'
      // Pour choisir le type de fiches
      c += '<div>'
      c += UI.Html.checkbox(
        {id:"param_search-fiche_type-all", class:"param_search", onchange:"$.proxy(Search.onchange_tout_type_fiche, Search, this.checked)()", value:"type_fiche-all", label:"Tous"})
      c += L(FICHES.datatype).collect(function(id,dtype){
        return UI.Html.checkbox({
          id:"param_search-fiche_type-"+id, class:"param_search", value:'type_fiche-'+id, label:dtype.hname.capitalize()
        })
      }).join("")
      c += '</div><div style="margin-top:10px;">'
      // Pour choisir le niveau de développement de la fiche
      c += UI.Html.select({
        id:"param_search-dev_min", class:"param_search", data:{'data-param':'dev-min'},
        label:"D'un développement compris entre ", options:FICHES.DATA_DEV
      })
      c += UI.Html.select({
        id:"param_search-dev_max", class:"param_search", data:{'data-param':'dev-max'},
        label:"&nbsp;et ", options:FICHES.DATA_DEV
      })
      c += '</div>'
      c += '</fieldset>'
      return c
    }
  },
  /** Retourne le code HTML pour le fieldset des options dans le formulaire
    * @property {String} fieldset_options
    */
  "fieldset_options":{
    get:function(){
      return '<fieldset id="search_form_fs_options"><legend>Options</legend>' +
        L([
          {id:'event_not_printed', label:"Même dans les fiches “Not printed”", 
          class:"param_search", value:"even_not_printed", indiv:true}
          ]).collect(function(dfield){
            return UI.Html.checkbox($.extend(dfield,{id:"param_search-"+dfield.id}))
        }).join("") + '</fieldset>'
    }
  },
  /** Retourne le code HTML pour les options de retour
    * @property {String} fieldset_retour
    */
  "fieldset_retour":{
    get:function(){
      var c = ""
      c += '<fieldset id="search_form-options_retour"><legend>Options pour le retour</legend>'
      c += UI.Html.checkbox({id:"param_search-whole_text", class:"param_search", label:"Remonter le texte entier (sinon, seulement extrait)", value:"whole_text"})
      c += '</fieldset>'
      return c
    }
  },
  "html_buttons_form":{
    get:function(){
      return  '<div class="buttons">'+
                '<input type="button" value="Renoncer" class="fleft" onclick="$.proxy(Search.hide, Search)()" />'+
                '<input type="button" value="Rechercher" onclick="$.proxy(Search.proceed, Search)()" />'+
              '</div>'
    }
  },
  "html_fields_result":{
    get:function(){
      return '<div id="search_result_list" class="fields"></div>'
    }
  },
  "html_buttons_result":{
    get:function(){
      return  '<div class="buttons">'+
                '<input type="button" value="Autre recherche" class="fleft" onclick="$.proxy(Search.toggle, Search)()" />'+
                '<input type="button" value="OK" onclick="$.proxy(Search.hide, Search)()" />'+
              '</div>'
    }
  }
})


window.find = Search.find