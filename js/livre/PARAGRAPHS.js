/*
 *  Objet PARAGRAPHS
 *  ----------------
 *  Pour la gestion des paragraphes dans leur ensemble
 *  
 */
window.PARAGRAPHS = {
  
  /*
   *  La fiche du paragraphe courant (instance Fiche::Paragraph)
   *  
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
    var id ;
    if(!selectors || selectors.length == 0) return
    L(selectors).each(function(selector){
      $('ul#paragraphs_menu_styles > li.'+selector+' input[type="checkbox"]')[0].checked = true
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
    this.current.on_change_styles( this.current_styles )
    // this.toggle_section_styles() // NON
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
    if(this.current != FICHES.current) this.current = FICHES.current
    if(this.current_styles === null) this.current_styles = this.current.style
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
  }
}

Object.defineProperties(PARAGRAPHS, {
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
      var btn_apply = '<input type="button" value="Appliquer" onclick="$.proxy(PARAGRAPHS.apply_styles, PARAGRAPHS)()" />'
      var buttons   = '<div class="buttons">' +
                        btn_apply +
                      '</div>'
      var code =  '<div id="divuniq_menu_styles">' +
                  '<a onclick="PARAGRAPHS.toggle_section_styles(); return false">Style(s) du paragraphe…</a>' +
                  '<div id="div_paragraph_styles" style="display:none;">' +
                    '<div id="div_apercu_paragraph">' +
                      '<li id="apercu_paragraph">Aperçu du style du paragraphe</li>' +
                    '</div>' +
                 buttons
      code += '<ul id="paragraphs_menu_styles">'
      L(PARAGRAPH_STYLES).each(function(selector){
        id  = "paragraph_style-"+selector ;
        code += '<li class="'+selector+'">'+
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