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
    * @method show_form
    *
    */
  show_form:function()
  {
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
    */
  show_result:function()
  {
    this.panneau.show()
    this.panneau_result.show()
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
     Ajax.send(
       {script:'fiche/search', text:text, params:params},
       $.proxy(this.found, this)
     )
  },
  /**
    * Méthode appelée par le bouton "Rechercher" du formulaire.
    * Elle rassemble les paramètres de la recherche et invoque la méthode `find`
    * pour effectuer cette recherche
    * @method proceed
    * @async
    */
  proceed:function()
  {
    var text    = $('div#search input#search_text').val().trim()
    var params  = {}
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
    if(rajax.ok) this.display_found(rajax.found)
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
  /**
    * TODO
    *   * types de fiches
    *   * ptype des paragraphes
    */
  "html_fields_form":{
    get:function(){
      return  '<div class="fields">'+
                '<input id="search_text" type="text" placeholder="Expression à rechercher" />' +
              '</div>'
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
      return '<div class="fields">'+'</div>'
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