/*
 *  Class Fiche
 *  -----------
 *
 *  Toutes les instances Book, Page, Chapter et Paragraph héritent d'elle
 *
 *
 *  RAPPELS
 *  -------
 *
 *  * C'est en ajoutant un enfant à une fiche qu'on détermine les propriétés
 *    `parent' et `enfants' des deux fiches concernant.
 *    cf. la méthode "add_enfant".
 *
 */

// Classe Fiche
window.Fiche = function(data)
{
  dlog("---> Fiche (instanciation)", DB_FCT_ENTER)
  
  this.class      = "Fiche"
  this.id         = null
  this.created_at = null
  this.type       = null      // le type, entre 'book', 'page', 'chap', 'para'
  
  // --- State ---
  // (ci-dessous les valeurs par défaut)
  this.loaded     = false   // Mis à true si elle est entièrement chargée
  this.deleted    = false
  // this.opened     = true   // Propriété complexe
  // this.ranged     = false  // propriété complexe
  this.selected   = false
  this.built      = false  // mis à true quand la fiche est construite
  this.retourned  = false   // Mis à true quand c'est le verso affiché
  this.draggable  = false
  this.sortable   = false
  if(undefined == data) data = {}
  
  // Nouvelle fiche ?
  // @note: Il faut le faire avant que ne soient dispatchées les valeurs,
  // car la définition de ces valeurs fait appel à d'autres méthodes qui
  // utilisent l'identifiant (par exemple les méthodes de type `_jid')
  if(undefined == data.id || data.id == null) 
  {
    this.created_at = Time.now()
    this.id = ++ FICHES.last_id
    this.loaded = true
  }
  
  this.dispatch( data )
  
  FICHES.add( this )
  dlog("<- Fiche (instanciation)", DB_FCT_ENTER)
  
}

Object.defineProperties(Fiche.prototype, {
  
  /* ---------------------------------------------------------------------
   *      DONNÉES DE LA FICHE
   --------------------------------------------------------------------- */
  "type":{
    get:function(){ return this._type || null},
    set:function(ty){ this._type = ty }
  },
  /* Méthode pratique retournant <type>#<id> (p.e. 'book#12') */
  "type_id":{
    get:function(){ return this.type_id}
  },
  /*
   *  Retourne un {Array} des minidata des enfants 
   *  
   */
  "enfants_as_minidata":{
    get:function(){
      arr = []
      for(var i in this.enfants){ 
        arr.push(this.enfants[i].minidata)
      }
      return arr
    }
  },

  /* ---------------------------------------------------------------------
   *      PROPRIÉTÉS D'ÉTAT
   --------------------------------------------------------------------- */
  "modified":{
    set:function(val){ 
      this._modified      = val;
      if(val) Collection.add_modified( this ) ;
    },
    get:function(){return this._modified || false }
  },
  
  /*
   *  Marque la fiche ouverte ou fermé (ou retourne la propriété)
   *  
   */
  "opened":{
    get:function(){ return this._opened || false },
    set:function(opened){
      this._opened = opened
      this.obj[opened?'addClass':'removeClass']('opened')
    }
  },

  /*
   *  Marque l'élément rangé ou non rangé (ou retourne la propriété ranged)
   *  
   */
  "ranged":{
    get:function(){ return this._ranged || false },
    set:function(ranged){
      this._ranged = ranged
      this.obj[ranged?'addClass':'removeClass']('ranged')
    }
  },

  /* ---------------------------------------------------------------------
   */
  /*
   *  Vérifie si la fiche peut être ouverte
   *  Pour être ouverte, la fiche doit être `loaded' et ses enfants doivent
   *  l'être aussi.
   *
   *  Rappel :  Les enfants, dans la fiche, sont toujours des instances Fiche.
   *            (réglées au chargement du parent). C'est leur propriété `loaded'
   *            qui détermine si elles sont chargées ou non.
   *
   */
  "is_openable":{
    get:function(){
      var i = 0, ichild ;
      if(this.is_paragraph) return true ; // toujours ouvrable
      if(this.loaded == false) return false ;
      if(!this.enfants || this.enfants == []) return true ;
      for(len = this.enfants.length; i<len; ++i)
      {
        ichild = this.enfants[i]
        if(false == (ichild.loaded && ichild.built) ) return false
      }
      // Si on arrive ici, c'est que tous les éléments ont été chargés
      return true
    }
  },
  "is_not_openable":{
    get:function(){return this.is_openable == false}
  },
  /* ---------------------------------------------------------------------
   *      PROPRIÉTÉS DOM
   --------------------------------------------------------------------- */

  /*
   *  Raccourcis pour obtenir les éléments DOM de la fiche
   *    
   */
  /* Définit et retourne le JID de la fiche */
  "jid":{
    get:function(){
      if(this._jid == undefined) this._jid = "fiche#"+this.dom_id ;
      return this._jid
    }
  },
  /* Définit et retourne le `dom_id' qui va permettre de construire l'id des éléments DOM */
  "dom_id":{
    get:function(){
      if(this._dom_id == undefined) this._dom_id = "f-"+this.id ;
      return this._dom_id
    }
  },
  /* Recto de la fiche */
  "recto_jid":{get:function(){return 'recto#'+this.dom_id+'-recto'}},
  "recto":{get:function(){ return $(this.recto_jid) }},
  
  /* Verso de la fiche */
  "verso_jid":{get:function(){ return 'verso#'+this.dom_id+'-verso'}},
  "verso":{get:function(){ return $(this.verso_jid) }},
  
  
  /* ---------------------------------------------------------------------
   *  Champ principal
   *
   *  - C'est le titre pour les book, chap et page. C'est le texte pour les
   *    paragraphes.
   *  - Il peut être en champ de saisie (input-text ou textarea) quand la fiche
   *    est ouverte ou div quand la fiche est fermée (tout type).
   *
   *  C'est donc une propriété définie dynamiquement.
   *
   */
  
  /* Propriété principale */
  "main_prop":{
    get:function(){return this.is_paragraph ? 'texte' : 'titre' }
  },
  
  /* 
   * Retourne le champ principal (soit div soit saisie suivant le contexte) 
   *
   *  NOTES
   *  -----
   *  Pour forcer la définition, utiliser `this._main_field = null'
   *
   */
  "main_field":{
    get:function(){
      if(!this._main_field)
      {
        if(this.is_paragraph)
        {
          if(this.opened) this._main_field = $(this.textarea_texte_jid)
          else            this._main_field = $(this.div_texte_jid)
        }
        else
        {
          if(this.opened) this._main_field = $(this.input_titre_jid)
          else            this._main_field = $(this.div_titre_jid)
        }
      }
      return this._main_field
    },
    set:function(obj){this._main_field = obj}
  },
  "main_field_as_div":{
    get:function(){ 
      return $(this.is_paragraph ? this.div_texte_jid : this.input_titre_jid)
    }
  },
  "main_field_as_input":{
    get:function(){
      return $(this.is_paragraph ? this.textearea_texte_jid : this.input_titre_jid)
    }
  },
  "titre_id"        :{get:function(){return this.dom_id+'-titre'}},
  "input_titre_jid" :{get:function(){return 'input#'+this.titre_id}},
  "div_titre_jid"   :{get:function(){return 'div#'+this.titre_id}},
  
  /* Remplace le DIV du main field par son champ d'édition (tout type de fiche) */
  "set_main_field_as_input":{
    get:function(){
      if(this.is_paragraph) this.texte_in_textarea
      else                  this.titre_in_input
      this.main_field = this.main_field_as_input
    }
  },
  "set_main_field_as_div":{
    get:function(){
      if(this.is_paragraph) this.texte_in_div
      else                  this.titre_in_div
      this.main_field = this.main_field_as_div
    }
  },
  "titre_in_input":{
    get:function(){
      if(this.main_field_as_div.length == 0)
      {
        console.error("Le DIV du champ principal de "+this.type_id+" est introuvable…")
      }
      else this.main_field_as_div.replaceWith(this.html_input_titre)
    }
  },
  "titre_in_div":{
    get:function(){
      if(this.main_field_as_input.length == 0)
      {
        console.error("Le champ de saisie principal de "+this.type_id+" est introuvable…")
      }
      else this.main_field_as_input.replaceWith( this.html_div_titre )
    }
  },
  /* Place le texte dans un textarea */
  "texte_in_textarea":{
    get:function(){
      var idm = "Paragraph::texte_in_textarea ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      if(this.main_field_as_div.length == 0)
      {
        console.error("Le DIV du champ principal de "+this.type_id+" est introuvable…")
      }
      else this.main_field_as_div.replaceWith(this.html_textarea_texte)
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /* Place le texte dans un div */
  "texte_in_div":{
    get:function(){
      var idm = "Paragraph::texte_in_div ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      if(this.main_field_as_input.length == 0)
      {
        console.error("Le champ de saisie principal de "+this.type_id+" est introuvable…")
      }
      else this.main_field_as_input.replaceWith( this.html_div_texte )
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  /* /Fin champ principal
     --------------------------------------------------------------------- */
  
  /* ---------------------------------------------------------------------
   *
   *  Items de la fiche
   *  
   */
  /* Div des items (children) de la fiche */
  "items_jid":{get:function(){return 'div#'+this.dom_id+'-items'}},
  "div_items":{
    get:function(){
      if(!this._div_items || this._div_items.length == 0) this._div_items = $(this.items_jid);
      return this._div_items
    }
  },
  
  
  /*
   *  Définit si nécessaire l'objet jQuery de la fiche et le retourne
   *  
   */
  "obj":{
    get:function(){
      if(undefined == this._obj){
        var obj = $(this.jid)
        obj.length && (this._obj = obj)
      } 
      return this._obj
    }
  },
  
  /* Retourne le DOM élément de la fiche */
  "dom_obj":{
    get:function(){
      if(undefined == this._dom_obj) this._dom_obj = this.obj[0]
      return this._dom_obj
    }
  },
    
  /*
   *  Positionne la fiche sur le table en fonction de :
   *    - son état ranged ou non
   *    - ses top / left
   */
  "positionne":{
    get:function(){
      if( this.ranged || this.top == null || !this.obj ) return
      this.obj.css({'top':this.top+"px", 'left':this.left+"px"})
    }
  },
  
  /*
   *  Création d'une nouvelle fiche
   *  -----------------------------
   *  
   *  NOTES
   *  -----
   *  * Il ne suffit pas de créer la fiche pour qu'elle soit mise en 
   *    sauvegarde. Cela permet de les créer tranquillement lors du chargement
   *    de la collection.
   *    C'est seulement lorsqu'un élément de la fiche aura été modifié (et
   *    notamment le titre ou le texte — paragraph) qu'elle sera prête pour
   *    l'enregistrement.
   */
  "create":{
    get:function(){
      dlog("---> Fiche::create ("+this.type_id+")", DB_FCT_ENTER)
      this.build
      this.set_values
      dlog("<- Fiche::create ("+this.type_id+")", DB_FCT_ENTER)
      return true
    }
  },
  
  /*
   *  Construction de la fiche sur la table
   *  
   */
  "build":{
    get:function(){
      var idm = "Fiche::build ["+this.type_id+"]" ;
      dlog("---> " + idm, DB_FCT_ENTER)
      // On ajoute le code ou on le remplace
      if(this.obj) this.obj.replaceWith( this.html )
      else         $('section#table').append( this.html )
      // On marque la fiche construite
      this.built = true
      // Elle est toujours construite fermée
      this.close
      // On positionne la fiche
      this.positionne
      // On place les observers
      this.observe
      dlog("<- " + idm, DB_FCT_ENTER)
      return true
    }
  },
  
  /*
   *  Place tous les OBSERVERS sur la fiche
   *  
   */
  "observe":{
    get:function(){
      var idm = "Fiche::observe ["+this.type_id+"]" ;
      dlog("---> " + idm, DB_FCT_ENTER)
      var obj ;
      // On doit la rendre draggable
      this.rend_draggable
      // Le click sur la fiche doit activer sa sélection
      this.obj.bind('click', $.proxy(this.toggle_select, this))
      if(this.is_book)
      {
        // La modification du titre réel doit entrainer son update
        obj = this.input_real_titre
        obj.bind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
        obj.bind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
        this.input_real_titre[0].onchange = $.proxy(this.onchange_real_titre, this)
      }
      // Toutes les fiches hors paragraphes doivent être droppable et
      // accepter un élément de rang inférieur
      var accepted_child = FICHES.datatype[this.type].child_type
      if(this.is_not_paragraph)
      {
        this.obj.droppable({
          hoverClass  :'dropped',
          accept      : '.fiche.'+accepted_child+
                        ', .card_tool[data-type="'+accepted_child+'"]',
          drop        :$.proxy(this.on_drop, this)
        })
      }
      dlog("<- " + idm, DB_FCT_ENTER)
      return true
    }
  },
  /*
   *  Rend la fiche sortable (lorsqu'elle est rangée)
   *  
   */
  "rend_sortable":{
    get:function(){
      this.obj.sortable({
        // 'containment': this.parent.div_items,
        'grid'    : [200,0],
        'cursor'  : 'move',
        'opacity' : 0.5,
        'scroll'  : true,
        'change'  : function(evt, ui)
        {
          /* appelé si changement de position*/
          dlog(this.type_id+" a changé de position")
        },
        'out' :function(evt,ui)
        {
          dlog(this.type_id+" sort de son parent")
        },
        'over':function(evt,ui)
        {
          dlog(this.type_id+" passe sur une liste qui peut l'accepter")
        },
        'start':function(evt,ui)
        {
          dlog("Début du déplacement (sort) de "+this.type_id)
        },
        'stop':function(evt,ui)
        {
          dlog("Fin du déplacement (sort) de "+this.type_id)
        }
      })
      this.sortable = true
    }
  },
  /*
   *  Rend la fiche draggable (lorsqu'elle est posée sur la table)
   *  
   */
  "rend_draggable":{
    get:function(){
      var idm = "Fiche::rend_draggable ("+this.type_id+")"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.obj.draggable({
        containment:'parent',
        stop: $.proxy(this.stop_drag, this)
      })
      this.draggable = true
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  /*
   *  Désactive/réactive l'édition du titre (ou du texte pour le paragraphe)
   *  
   *  PRODUIT
   *  -------
   *    # Remplace le div contenant le titre (ou le texte) par un champ
   *      de saisie.
   *    # Place les observers sur le champ de saisie.
   *
   */

  "enable_main_field":{
    get:function(){
      var idm = "Fiche::enable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.set_main_field_as_input
      var obj = this.main_field
      obj.unbind('dblclick', $.proxy(FICHES.on_dblclick, FICHES, this))
      obj.bind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
      obj.bind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
      obj[0].onchange = $.proxy(this.onchange_titre_or_texte, this)
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  "disable_main_field":{
    get:function(){
      var idm = "Fiche::disable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.set_main_field_as_div
      var obj = this.main_field
      if(FICHES.current_field_is( obj )) FICHES.onblur_textfield( this, {target:obj} )
      obj.bind('dblclick', $.proxy(FICHES.on_dblclick, FICHES, this))
      obj.unbind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
      obj.unbind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  /*
   *  Rend la fiche "ouvrable"
   *  (en chargeant ses données au besoin et ses enfants)
   *  
   */
  "rend_openable":{
    value:function(poursuivre){
      var idm = "Fiche::rend_openable ["+this.type_id+"]" 
      dlog("---> "+idm)
      if('string' == typeof poursuivre) poursuivre = {id:this.id, prop:poursuivre}
      FICHES.after_load.poursuivre = poursuivre
      FICHES.load( this.enfants_as_minidata )
      dlog("<- "+idm)
    }
  },
  
  /*
   *  Toggle (ouvre/ferme) la fiche
   *  
   */
  "toggle":{
    get:function(){
      this.opened ? this.close : this.open
    }
  },
  
  /*
   *  Ouvre la fiche
   *  --------------
   *
   *  NOTES
   *  -----
   *    # L'opération produit des résultats différents en fonction du type
   *      de la fiche. Par exemple, pour une page, on la sort de son parent
   *      et on montre ses enfants (paragraphes). Pour un chapitre, on ne
   *      fait que mettre son titre en édition.
   */
  "open":{
    get:function(){
      var idm = "Fiche::open ["+this.type_id+"]" 
      dlog("---> "+idm, DB_FCT_ENTER)
      if(this.is_not_openable) return this.rend_openable('open')
      this.opened = true
      if(this.is_page && this.parent) this.unrange
      this.enable_main_field
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /*
   *  Ferme la fiche
   *  --------------
   *
   *  NOTES
   *  -----
   *    # En mode fermé, le titre est disabled
   *
   */
  "close":{
    get:function(){
      var idm = "Fiche::close ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.opened = false
      if(this.is_page && this.parent) this.range
      this.disable_main_field
      dlog("<- "+idm, DB_FCT_ENTER)
    }  
  },
  
  /*
   *  Range la fiche
   *  
   *  NOTES
   *  -----
   *  * La fiche peut avoir un clone dans son parent, qu'il faut alors
   *    supprimer.
   *  * On supprime le draggable de la fiche et on ajoute un sortable
   *
   */
  "range":{
    get:function(){
      var idm = "Fiche::range ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      if(!this.parent) throw LOCALE.fiche.error['unable to range orphelin']
      if(this.obj_clone.length) this.unclone
      else this.parent.div_items.append( this.obj )
      if(this.draggable)
      {
        this.obj.draggable("destroy")
        this.draggable = false
      }
      this.rend_sortable
      this.ranged = true
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /*
   *  Sort la fiche de son rangement
   *  
   */
  "unrange":{
    get:function(){
      if(!this.parent) throw LOCALE.fiche.error['unable to unrange orphelin']
      this.clone
      if(this.sortable)
      {
        this.obj.sortable("destroy")
        this.sortable = false
      }
      this.rend_draggable
      this.ranged = false
    }
  },
  
  /* Retourne l'objet DOM du clone de la fiche */
  "obj_clone":{
    get:function(){return $('fiche#'+this.dom_id_clone)}
  },
  
  /*
   *  Clone/Déclone la fiche courante
   *
   *  "Cloner la fiche" consiste à :
   *    - Placer un clone de la fiche dans le parent, à la place de la fiche
   *    - Sortir le DOM Objet du parent pour le mettre sur la table
   *  "Décloner" la fiche consiste à :
   *    - Remettre la fiche dans le parent
   *    - Détruire le clone
   */
  "clone":{
    get:function(){
      this.clone_in_parent
      $('section#table').append( this.obj )
    }
  },
  "unclone":{
    get:function(){
      if(this.obj_clone.length == 0) throw "Clone introuvable pour la fiche #"+this.dom_id
      this.obj.insertAfter( this.obj_clone )
      this.obj_clone.remove()
    }
  },
  /*
   *  Place un clone de la fiche dans son parent
   *  
   */
  "clone_in_parent":{
    get:function(){
      $(this.html_clone).insertAfter( this.obj )
    }
  },
  

  /*
   *  Met les valeurs de la fiche dans l'élément DOM de la fiche
   *  
   *  TODO: La fiche est complètement à implémenter suivant les valeurs
   *        qui seront éditables.
   */
  "set_values":{
    get:function(){
      var idm = "Fiche::set_values ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.main_field.set(this.main_field_value)
      if(this.is_book) this.input_real_titre.val(this.real_titre || "TITRE RÉEL")
      dlog("<- "+idm, DB_FCT_ENTER)
      return true
    }
  },
  /*
   *  Retourne une valeur pour le champ principal (titre ou texte)
   *  
   */
  "main_field_value":{
    get:function(){
      if(this.is_paragraph) return this.texte || "TEXTE_PARAGRAPHE"
      else                  return this.titre || "TTITRE"
    }
  },
  
  /*
   *  Retourne la fiche
   *  
   */
  "retourne":{
    get:function()
    {
      this.recto[this.retourned ? 'show' : 'hide']()
      this.verso[this.retourned ? 'hide' : 'show']()
      this.retourned = !this.retourned
      if(this.retourned) this.regle_verso
    }
  },
  
  /*
   *  Retourne le code HTML pour la fiche
   *  
   */
  "html":{
    get:function(){
      return  '<fiche id="' + this.dom_id + '" class="fiche '+this.type+'">' +
              this.html_recto + this.html_verso +
              '</fiche>' ;
    }
  },
  
  /*
   *  Retourne le code HTML du RECTO de la fiche
   *  
   */
  "html_recto":{
    get:function(){
      return  '<recto id="'+this.dom_id+'-recto" class="'+this.type+'">'+
              this.html_input_titre_and_other + // + champ 'real_titre' pour Book
              this.html_div_items   + // empty pour les paragraphes
              '</recto>'
    }
  },
  
  /* Retourne le code HTML pour le titre de la fiche (sauf paragraphe) */
  "html_input_titre_and_other":{
    get:function(){
      if(this.is_paragraph) return this.html_div_texte
      var c = this.html_input_titre
      if(this.is_book) c += this.html_input_real_titre
      return c
    }
  },
  /*
   *  3 Méthodes pour construire le titre
   *  Car le titre peut apparaitre dans un DIV quand la fiche est fermée,
   *  ou dans un INPUT quand la fiche est ouverte.
   *  
   */
  "html_input_titre":{
    get:function(){
      return '<input id="'+this.titre_id+'" type="text" class="titre" value="'+
              (this.titre || FICHES.datatype[this.type].defvalue) +
              '" />'
    }
  },
  "html_div_titre":{
    get:function(){
      return '<div id="'+this.titre_id+'" class="titre">' + 
              (this.titre || FICHES.datatype[this.type].defvalue) +
              '</div>'
    }
  },
  
  /* Retourne le code HTML pour le div des items de la fiche (sauf paragraphe) */
  "html_div_items":{
    configurable:true,
    get:function(){
      return this.is_paragraph ? "" : '<div id="'+this.dom_id+'-items" class="items"></div>'
    }
  },
  
  /*
   *  Retourne le code HTML du VERSO de la fiche
   *  -------------------------------------------
   */
  "html_verso":{
    get:function(){
      return  '<verso id="'+this.dom_id+'-verso" class="'+this.type+'" style="display:none;">'+
                '<div id="'+this.titre_verso_id+'" class="titre_verso"></div>' +
                this.html_fieldset_parametres +
              '</verso>'
    }
  },
  /*
   *  Règle le verso
   *  --------------
   *  Cette méthode est appelée quand on retourne la fiche, entendu qu'on ne
   *  définit pas vraiment son verso à l'affichage. Et puis certaines valeurs,
   *  comme le titre, ne sont pas affichées.
   *  Donc c'est seulement quand on la met au verso qu'on règle les choses
   *  suivant les fiches.
   *
   */
  "regle_verso":{
    get:function(){
      this.set_titre_verso
      if(undefined != this.after_regle_verso) this.after_regle_verso
    }
  },
  
  /*
   *  Au verso, le fielset contenant les paramètres
   *  
   */
  "fieldset_parametres":{get:function(){return $(this.fieldset_parametres_jid)}},
  "fieldset_parametres_jid":{get:function(){return "fieldset#"+this.fieldset_parametres_id}},
  "fieldset_parametres_id":{get:function(){return this.dom_id+'-fieldset_parametres'}},
  "html_fieldset_parametres":{
    get:function(){
      return '<fieldset id="'+this.fieldset_parametres_id+'">' +
        '<legend>Paramètres</legend>'+
        '</fieldset>'
    }
  },
  
  "titre_verso_id":{get:function(){return this.dom_id+"-titre_verso"}},
  "titre_verso_jid":{get:function(){return 'div#'+this.titre_verso_id}},
  "set_titre_verso":{
    get:function(){
      $(this.titre_verso_jid).html(
        "Verso " + FICHES.datatype[this.type].hname + " #" + this.id + " : " + 
        (this.is_paragraph ? (this.texte || "").substring(0, 50) : this.titre)
      )
    }
  },
  
  /* Retourne le dom_id du clone */
  "dom_id_clone":{
    get:function(){return "clone"+this.dom_id }
  },
  /*
   *  Retourne le code HTML pour un clone de la fiche (dans parent)
   *  
   *  @note:  Pour le moment, seul une page a besoin d'un clone
   */
  "html_clone":{
      // id = 'clone'+this.dom_id => "clonef-12"
    get:function(){
      return '<fiche id="'+this.dom_id_clone+'" class="fiche '+this.type+' clone">'+
        '<recto>'+
          '<div id="'+this.dom_id_clone+'-titre" class="titre">'+this.titre+'</div>'+
        '</recto>'+
      '</fiche>'
    }
  },
  
  /*
   *  Sauvegarde de la fiche (utile ?)
   *  
   */
  "save":{
    configurable:true,
    get:function(){
      return true
    }
  },
  
  /*
   *  Retourne les données à enregistrer
   *  
   */
  "data":{
    configurable:true,
    get:function(){
      data = {
        id:this.id, type:this.type, titre:this.titre, deleted:this.deleted,
        opened:this.opened, ranged:this.ranged,
        top:this.top, left:this.left
      }
      if(this.parent)  data.parent = {id:this.parent.id, type:this.parent.type}
      if(this.enfants)
      {
        data.enfants = []
        for(var i in this.enfants){ 
          data.enfants.push(this.enfants[i].minidata)
        }
      }
      if(this.is_book) data.real_titre = this.real_titre
      if(this.is_paragraph) data.texte = this.texte
      return data
    }
  },
  
  /*
   *  Retourne le {Hash} des données minimum de la fiche (id et type)
   *  
   */
  "minidata":{
    get:function(){return {id:this.id, type:this.type}}
  },
  
  /*
   *  Destruction totale d'une fiche
   *  
   */
  "remove":{
    configurable:true,
    get:function(){
      this.obj.remove()
      this.delete ;
    }
  },
  
  /*
   *  Volonté de supprimer la fiche (confirmation)
   *
   *  Si la confirmation est demandée, la méthode "delete" est vraiment appelée  
   */
  "want_delete":{
    get:function(){
      Edit.show({
        id:'kill_fiche',
        title: LOCALE.fiche['want delete fiche'],
        fields:{
          kill_children:{type:'checkbox', value:"true", libelle:LOCALE.fiche['kill children'], checked:false}
        },
        buttons:{
          cancel:{name:"Renoncer"},
          ok:{name:"Détruire la fiche", onclick:$.proxy(FICHES.remove, FICHES, this)}
        }
      })
    }
  },
  /*
   *  Suppression d'une fiche
   *  
   *  NOTE: CETTE PROPRIÉTÉ NE DOIT PAS ÊTRE APPELÉE
   *        Il faut appeler <fiche>.want_delete (qui appelle ensuite FICHES.remove)
   */
  "delete":{
    get:function(){
      this.deleted  = true
      this.modified = true
      this.obj.remove()
    }
  },
  
  /*
   *  ---------------------------------------------------------------------
   *    Changement d'état
   *  
   */
  /* Sélection et désélection de la fiche 
   *
   * NOTES
   * -----
   *  # Stoppe l'évènement pour qu'il ne se propage pas aux fiches
   *    ancêtres si elles existent.
   *
   * @param evt   Évènement click qui a permis de sélectionner/déselectionner la fiche
   *              En fonction de la pression ou non de la touche majuscule le comportement
   *              et différent.
   */
  "toggle_select":{
    value:function(evt){
      var with_maj = (evt.shiftKey == true)
      // Si la fiche est sélectionnée et que la touche majuscule est
      // pressée, il faut déselectionner la fiche
      if(this.selected){ if(with_maj) this.deselect }
      else this.select
      return stop_event(evt)
    }
  },
  "select":{
    get:function(){
      FICHES.add_selected( this )
      this.selected = true
      if(this.built) this.obj.addClass('selected')
    }
  },
  "deselect":{
    get:function(){
      FICHES.remove_selected( this )
      this.selected = false
      if(this.built) this.obj.removeClass('selected')
    }
  },
  
  "is_book"           :{get:function(){ return this._type == 'book'}},
  "is_not_book"       :{get:function(){ return this._type != 'book'}},
  "is_chapter"        :{get:function(){ return this._type == 'chap'}},
  "is_not_chapter"    :{get:function(){ return this._type != 'chap'}},
  "is_page"           :{get:function(){ return this._type == 'page'}},
  "is_not_page"       :{get:function(){ return this._type != 'page'}},
  "is_paragraph"      :{get:function(){ return this._type == 'para'}},
  "is_not_paragraph"  :{get:function(){ return this._type != "para"}},

  "titre":{
    get:function(){return this._titre || null },
    set:function(titre){ this._titre = titre}
  },
  
  "updated_at":{
    get:function(){ return this._updated_at },
    set:function(time){this._updated_at = time}
  },
  
  "resume":{
    get:function(){ return this._resume },
    set:function(resume)
    {
      if(resume.trim() == "") resume = null
      this._resume = resume
    }
  },
  
  /*
   *  Définit ou retourne les enfants de la fiche
   *  
   */
  "enfants":{
    get:function(){return this._enfants },
    set:function(children){ this._enfants = children },
  },

  /*
   *  Définit ou retourne le parent de la fiche
   *  
   */
  "parent":{
    get:function(){ return this._parent },
    set:function(pere)
    {
      try
      {
        if(!pere || 'object' != typeof pere) throw 'parent should be an object';
        if(pere.class != "Fiche")   throw 'parent should be a fiche';
        thislevel = FICHES.datatype[this.type].level ;
        perelevel = FICHES.datatype[pere.type].level ;
        if( thislevel >= perelevel ) throw 'parent bad type';
      }
      catch(err)
      { 
        throw LOCALE.fiche.error[err]
      }
      
      this._parent = pere
    }
  },
  
  /*
   *  Définition et retour de la position horizontale (left) de
   *  la fiche sur la table
   */
  "left":{
    get:function(){ return this._left || null },
    set:function(left){
      this._left = parseInt(left, 10)
      if( !this.ranged ) this.positionne
    }
  },
  
  /*
   *  Définition et retour de la position haute (top) de la fiche 
   *  sur la table.
   *  
   */
  "top":{
    get:function(){ return this._top || null },
    set:function(top){
      this._top = parseInt(top, 10)
      if( !this.ranged ) this.positionne
    }
  }
  
  
})

/*
 *  Appelé quand on droppe un enfant sur la fiche courante
 *  
 *  @param  evt   L'évènement drop
 *  @param  ui    L'objet déplacé (ui.element est l'original)
 *                Note : l'original peut être soit une fiche réelle, soit
 *                un card-tool. Lorsque c'est une card-tool, il faut créer la
 *                nouvelle fiche.
 */
Fiche.prototype.on_drop = function(evt, ui)
{
  var obj_moved=ui.draggable, ichild, is_tool=obj_moved.hasClass('card_tool') ;
  
  if(is_tool)
  {
    // On crée la fiche
    ichild = FICHES.full_create({
      type: obj_moved.attr('data-type'),
      left: 100, top: 100
    })
  }
  else
  {
    ichild = FICHES.domObj_to_fiche( obj_moved )
  }
  this.add_child( ichild )
  
  // Si cette fiche parent est fermée, il faut l'ouvrir
  if(false == this.opened) this.open

  if(is_tool)
  {
    // Si c'est une création, on "ouvre" toujours l'élément, et
    // on sélectionne le champ de saisie principal
    // @note: Ça doit aussi sélectionner l'enfant
    ichild.open
    ichild.main_field.select()
  }
  
  // TODO: Plus tard, on pourra regarder si la fiche a été déposé à un
  // endroit précis, pour le placer au bon endroit dans les enfants
  // F.error("La méthode Fiche.on_drop doit être implémentée"+
  // "\nÉlément #"+obj_moved.attr('id')+" (outil ? "+is_tool+") glissé sur fiche #"+this.id)
}

// C'est la méthode principale de création d'une relation entre
// deux fiches. C'est elle qui ajoute l'enfant et définit le parent
// de l'enfant.
// @param   enfant    {Fiche} Instance Fiche du type attendu.
Fiche.prototype.add_child = function(enfant, before_child)
{
  try
  {
    if(!enfant || 'object'!=typeof enfant)  throw 'child should be an object'
    if( enfant.class != 'Fiche')            throw 'child should be a fiche'
    thislevel = FICHES.datatype[this.type].level ;
    chillevel = FICHES.datatype[enfant.type].level ;
    if( thislevel <= chillevel )            throw 'child bad type'
  }
  catch(err){throw LOCALE.fiche.error[err]}
  
  // Ajout de l'enfant à la liste
  if(this.enfants == null) this.enfants = []
  this.enfants.push( enfant )
  // Définition du parent de l'enfant
  enfant.parent = this
  
  // On ferme toujours l'enfant
  enfant.close
  
  // Ajout de l'enfant dans le div_items de la fiche
  if(undefined == before_child)
  { // => ajout à la fin
    this.div_items.append( enfant.obj )
  }
  else
  { // => Ajout avant l'enfant before_child
    enfant.obj.insertBefore( before_child.obj )
  }
  
  this.modified   = true
  enfant.ranged   = true
  enfant.modified = true
    
}

/*
 *  Méthode appelée quand on change le titre de la fiche
 *  
 *  NOTES
 *  -----
 *  @ Cela peut se produire lorsqu'on quitte le champ, ou lorsque
 *    l'on presse la touche RETURN sur le champ.
 *
 *  @ C'est vraiment cette fonction qui inaugure le changement du
 *    titre, car si c'était `titre=` (propriété complexe), on aura
 *    une difficulté à la définition des fiches remontées.
 *
 */

Fiche.prototype.onchange_titre_or_texte = function(evt)
{
  var idm = "Fiche::onchange_titre_or_texte ["+this.type_id+"]"
  dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
  var obj=this.main_field, prop=this.main_prop ;
  var new_value = obj.val()
  if(this[prop] != new_value)
  {
    this[prop]    = new_value
    this.modified = true    
  }
  dlog("<- "+idm, DB_FCT_ENTER)
}


Fiche.prototype.dispatch = function(data){
  dlog("---> Fiche::dispatch ["+this.type_id+"]", DB_FCT_ENTER)
  var prop, val ;
  for(prop in data)
  {
    if(false == data.hasOwnProperty(prop)) continue;
    val = data[prop] ;
    // Transformation de la valeur
    switch(val)
    {
    case "false": val = false ; break;
    case "true" : val = true; break;
    case "null" : val = null; break;
    }
    // Transformation en fonction de la propriété
    switch(prop)
    {
    case 'opened':
    case 'ranged':
      continue
      break
    case 'id': 
      val = parseInt(val, 10); 
      break;
    case 'type':
    case 'class':
      // Juste pour ne pas passer par default: qui mettrait
      // loaded à true
      break
    case 'titre':
    case 'real_titre':
    case 'texte':
      val = val.stripSlashes()
      if(prop != 'titre') this.loaded = true
      break;
    case 'parent':
      val = FICHES.fiche( val );
      this.loaded = true
      break;
    case 'enfants':
      if(val!=null && val.length > 0){
        val = FICHES.fiche( val )
      }
      this.loaded = true
      break;
    default:
      this.loaded = true
    }
    // On met la donnée dans la propriété
    this[prop] = val
  }
  dlog("<- Fiche::dispatch", DB_FCT_ENTER)
}

Fiche.prototype.remove_child = function(enfant)
{
  try
  {
    if('object' != typeof enfant || enfant.class != 'Fiche') throw 'child should be a fiche';
  }
  catch(err){ throw LOCALE.fiche.error[err] }
  
  var child_found = false
  for(var i = 0, len=this.enfants.length; i<len; ++i )
  { 
    if(this.enfants[i].id == enfant.id){ 
      this.enfants.splice(i, 1) 
      enfant._parent = null
      child_found = true
      break
    } 
  }
  
  if(child_found)
  {
    this.modified   = true
    enfant.modified = true
  }
}

/*
 *  Appelé à la fin du drag d'une fiche
 *  
 */
Fiche.prototype.stop_drag = function(evt, ui){
  var pos = this.obj.position()
  this.left = pos.left
  this.top  = pos.top
  this.modified = true
}

