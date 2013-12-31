/**
  * @module PARAGRAPHS
  */
/**
  * Pour la gestion des paragraphes ({Fiche} de type {Paragraph}) comme un ensemble
  *  
  * @class PARAGRAPHES
  * @static
  *
  */
window.PARAGRAPHS = {
  
  /**
    * Data pour le `ptypes` des paragraphes
    *
    * @property {Object} PTYPES
    * @static
    * @final
    */
  PTYPES:{
    'text' : {id:'text', hname:"Texte normal", return_disabled:true},
    'list' : {id:'list', hname:"Liste à puces (item MAJ+RETURN item...)"},
    'enum' : {id:'enum', hname:"Liste numérotée (item1 MAJ+RETURN item2...)"},
    'desc' : {id:'desc', hname:"Liste définitions (mot::description MAJ+RETURN ...)"},
    'file' : {id:'file', hname:"Fichier à insérer (PATH)", return_disabled:true},
    'revc' : {id:'revc', hname:"Evènemencier brut"},
    'tabl' : {id:'tabl', hname:"Tableau"},
    'code' : {id:'code', hname:"Code javascript à interpréter"},
    'ruby' : {id:'ruby', hname:"Code ruby à interpréter"},
    'fico' : {id:'fico', hname:"Fichier de code à jouer (PATH)", return_disabled:true}
  },
  
  /**
    * Indique que le menu des ptypes n'a pas été encore construit et inséré
    * dans la page
    * @property {Boolean} menu_ptypes_ready
    * @default False
    */
  menu_ptypes_ready: false,
  
  /**
    *  La fiche du paragraphe courant
    *  
    * @property current
    * @type {Paragraph}
    * @default  null
    */
  current: null,
  /* ---------------------------------------------------------------------
   *
   *  GESTION DES STYLES
   * 
   * --------------------------------------------------------------------- 
   */
  /*
   *  Code HTML pour le menu des styles
   *  
   *  NOTES
   *    :: ce code est ajouté au verso du paragraph retourné
   *    :: Il est construit par la méthode `build_menu_styles'
   *  
   */
  html_menu_styles:null,
  
  /*
   *  Les styles courants
   *  
   *  @note   Ils ne seront appliqués que si l'utilisateur clique "Appliquer"
   */
  current_styles: null,
  
  /*
   *  Ouvre ou ferme le div pour régler les styles
   *  
   */
  toggle_section_styles:function(){
    
    var ouvre = this.section_styles.is(':visible') == false
    this.section_styles[ouvre?'show':'hide']()
  },
  /*
   *  On coche tous les styles +selectors+ et seulement eux
   *  
   */
  active_styles:function(selectors)
  {
    this.deselectionne_all_selectors
    this.selectionne_selectors(selectors)
    this.set_apercu(selectors)
  },
  /*
   *  Sélectionne (coche) les styles +selectors+
   *  
   */
  selectionne_selectors:function(selectors)
  {
    var id, osel ;
    if(!selectors || selectors.length == 0) return
    L(selectors).each(function(selector){
      osel = $('ul#paragraphs_menu_styles > li.'+selector+' input[type="checkbox"]')
      if(osel.length) osel[0].checked = true
    })
  },
  /* Décoche la checkbox pour le style de paragraphe +style+ */
  decocher_style:function(style)
  {
    $('ul#paragraphs_menu_styles > li.'+style+' input[type="checkbox"]')[0].checked = false
  },
  /*
   *  Appliquer les styles courants au paragraphe courant
   *  
   */
  apply_styles:function()
  {
    this.current = FICHES.current
    this.current.on_change_styles( this.current_styles || [] )
    this.current.retourne
  },
  /*
   *  Ajoute ou retire un style de paragraphe au paragraphe courant
   *  
   *  NOTES
   *  -----
   *    :: La méthode est appelée quand on clique sur le LI du style
   *    :: La méthode gère les exclusions (impossible d'avoir deux sélecteurs
   *       qui commencent par le même mot clé)
   *
   *  @param  CB   L'objet DOM de la case à cocher (non jQuery) cliqué
   */
  add_remove_style:function(CB)
  {
    var selector = $(CB).parent().attr('class')
    var checked  = CB.checked == true
    if(this.current != FICHES.current)
    { 
      this.current = FICHES.current
      this.current_styles = this.current.style
    }
    else if(this.current_styles === null) this.current_styles = this.current.style
    if( ! this.current_styles ) this.current_styles = []
    if(checked)
    {
      // Gestion des exclusions
      this.check_exclusions_with( selector )
      // Ajout d'un style
      this.current_styles.push( selector )      
    }
    else
    {
      // Retrait d'un style
      this.current_styles.splice(this.current_styles.indexOf(selector), 1)      
    }
    this.set_apercu( this.current_styles )
  },
  
  /*
   *  Gestion des exclusions
   *
   *  La méthode regarde si un style de même premier mot existe dans la
   *  liste des styles courants et le supprime si c'est le cas.
   */
  check_exclusions_with:function(selector)
  {
    var currents = this.current_styles
    var premier_mot_selector = selector.split('_')[0]
    var new_currents = []
    L(currents).each(function(asel){
      if(asel.split('_')[0] == premier_mot_selector )
      {
        return $.proxy(PARAGRAPHS.decocher_style, PARAGRAPHS, asel)()
      } 
      new_currents.push( asel )
    })
    if(currents.length != new_currents.length)
    {
      // Des exclusions ont été trouvées
      this.current_styles = new_currents
    }
  },
  /*
   *  Réglage de l'aperçu en fonction des styles activés
   *  
   */
  set_apercu:function(selectors)
  {
    // Initialisation de l'aperçu
    $('li#apercu_paragraph').attr('class', '')
    if(!selectors || selectors.length == 0) return
    // On règle l'aperçu du paragraphe avec ses styles
    $('li#apercu_paragraph').addClass(selectors.join(' '))
  },
  
  /**
    * Méthode appelée par un click sur la CB "Show style aspect" pour
    * montrer l'aspect des styles ou par les préférences
    * @method show_aspect_styles
    * @param {Boolean} montrer    True s'il faut les montrer
    *
    */
  show_aspect_styles:function(montrer)
  {
    if(undefined == montrer){
      montrer = App.preferences.show_aspects_styles
    }else{
      App.preferences.show_aspects_styles = montrer
    }
    L(PARAGRAPH_STYLES).each(function(selector){
      $('li#'+"li-paragraph_style-"+selector)[(montrer?'add':'remove')+'Class'](selector)
    })
    $('ul#paragraphs_menu_styles')[(montrer?'remove':'add')+'Class']('small')
  }
}

Object.defineProperties(PARAGRAPHS, {
  
  /**
    * Construit le menu des ptypes
    * Notes
    *   * C'est la méthode qui demande la construction du code et l'insert
    *     simplement dans le body. La méthode appelante doit le placer au
    *     bon endroit.
    *   * Propriété complexe => appeler sans parenthèses
    * @method prepare_menu_ptypes
    */
  "prepare_menu_ptypes":{
    get:function(){
      $('body').append(this.html_menu_ptypes)
      this.menu_ptypes_ready = true
    }
  },
  /**
    * Code HTML pour le menu des ptypes
    *
    * @property {String} html_menu_ptypes
    */
  "html_menu_ptypes":{
    get:function(){
      var m = '<span class="libelle">Type de paragraphe : </span>'
      m += '<select id="menu_ptypes">'
      L(this.PTYPES).each(function(id, data){
        m += '<option value="'+data.id+'">Type : '+data.hname+'</option>'
      })
      m += '</select>'
      return m
    }
  },
  /*
   *  Retourne le set jQuery des styles
   *  
   */
  "section_styles":{
    get:function(){ return $('div#div_paragraph_styles') }
  },
  
  /*
   *  Construction du code HTML pour le menu des styles
   *  
   */
  "build_menu_styles":{
    get:function(){
      var id ;
      var btn_apply = '<input type="button" value="Appliquer" onclick="$.proxy(PARAGRAPHS.apply_styles, PARAGRAPHS)()" style="font-size:1.3em;" />'
      var cbs = '<div class="fleft">' +
                  '<input type="checkbox" id="cb_show_aspect_styles" onchange="$.proxy(PARAGRAPHS.show_aspect_styles,PARAGRAPHS,this.checked)()" />' +
                  '<label for="cb_show_aspect_styles">Show aspect</label>' +
                  '<input type="checkbox" id="cb_show_apercu_paragraph" onchange="$(\'div#div_apercu_paragraph\').toggle();" />' +
                  '<label for="cb_show_apercu_paragraph">Aperçu</label>' +
                '</div>' ;
      var buttons   = '<div class="buttons" style="font-size:0.9em">' +  
                        btn_apply +
                      '</div>'
      var code =  '<div id="divuniq_menu_styles">' +
                  '<a onclick="PARAGRAPHS.toggle_section_styles(); return false">Style(s) du paragraphe…</a>' +
                  '<div id="div_paragraph_styles" style="display:none;">' +
                    /* Aperçu de l'aspect du paragraphe */
                    '<div id="div_apercu_paragraph" style="display:none;">' +
                      '<li id="apercu_paragraph">Aperçu du style du paragraphe</li>' +
                    '</div>' +
                  cbs + 
                  buttons
      code += '<ul id="paragraphs_menu_styles">'
      L(PARAGRAPH_STYLES).each(function(selector){
        id  = "paragraph_style-"+selector ;
        code += '<li id="li-'+id+'">'+
                  '<input type="checkbox" id="'+id+'-cb" '+
                    'onchange="$.proxy(PARAGRAPHS.add_remove_style, PARAGRAPHS, this)()"' +
                    ' />'+
                  '<label for="'+id+'-cb">'+ selector.replace(/_/g, ' ')+'</label>'+
                '</li>'
      })
      code += '</ul>' + buttons + '</div>' + '</div>'
      this.html_menu_styles = code
      // On l'ajoute dans le body, il sera tout de suite placé dans
      // le verso d'un paragraphe
      $('body').append( this.html_menu_styles )
      this.show_aspect_styles()
    }
  },
  
  /*
   *  Désélectionner tous les styles du menu des styles de paragraphe
   *  
   */
  "deselectionne_all_selectors":{
    get:function(){
      $('ul#paragraphs_menu_styles > li').each(function(i){
        $(this).find('input[type="checkbox"]')[0].checked = false
      })
    }
  }
})