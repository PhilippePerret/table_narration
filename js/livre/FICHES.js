/**
  * @module FICHES
  *
  */

/**
  * Objet FICHES
  * ------------
  * Pour la gestion des fiches comme ensemble.
  *
  * @class  FICHES
  * @static
  *
  */
window.FICHES = {
  
  /**
    * Données pour les types de fiche
    *  
    * @property datatype
    * @type     {Object}
    * @static
    * @final
    */
  datatype:{
    'para'  : {level: 5 , defvalue: "TEXTE_PARAGRAPHE", child_type:null,    parent_type:'page', hname: "paragraphe"},
    'page'  : {level: 10, defvalue: "TITRE_PAGE",       child_type:'para',  parent_type:'chap', hname: "page"},
    'chap'  : {level: 15, defvalue: "TITRE_CHAPITRE",   child_type:'page',  parent_type:'book', hname: "chapitre"},
    'book'  : {level: 20, defvalue: "TITRE_LIVRE",      child_type:'chap',  parent_type:null,   hname: "livre"}
    },

  /**
    * Données pour le niveau de développement des fiches
    * Notes
    *   * Ne pas changer le nom des attributs 'value' et 'title' qui servent à
    *     construire des menus avec UI.Html.select
    *   * C'est un array. Pour récupérer une valeur, il suffit de faire :
    *     FICHES.DATA_DEV[&lt;niveau de développement de la fiche>]
    *
    * @property {Array} DATA_DEV
    * @static
    * @final
    */
  DATA_DEV:[
    {value:0, title:"Simple création"},
    {value:1, title:"Ébauche"},
    {value:2, title:"1ère version"},
    {value:3, title:"2e version"},
    {value:4, title:"3e version"},
    {value:5, title:"Version aboutie"},
    {value:6, title:"Relue et corrigée"},
    {value:7, title:"À finaliser"},
    {value:8, title:"À confirmer"},
    {value:9, title:"B.A.T"}
  ],
  /**
    * Indique si le menu développement a été fabriqué
    * @property {Boolean} menu_development_ready
    */
  menu_development_ready:false, 
  /**
    * Données pour les paramètres des fiches (verso)
    * Notes
    * -----
    *   * L'`id` correspond au nom de la propriété de classe
    * @property PARAMETRES_FICHE
    * @type     {Array} d'{Object}
    * @statif
    * @final
    */
  PARAMETRES_FICHE:[
    {id:'ptype', hname:"Type de paragraphe", only:'para', 
      value:["text:Texte", "code:Code", "file:Fichier", "list:Liste"]}
  ],
  
  /**
    * Données pour les options des fiches (verso)
    * Notes
    * -----
    *   * Pour des types propres à un type de fiche particulier, utiliser
    *     `only:<type>` ou `sauf:<type>`
    *   * L'`id` correspond au nom de la propriété de classe
    *
    * @property OPTIONS_FICHE
    * @type     {Array} d'{Object}
    * @static
    * @final
    */
  OPTIONS_FICHE:[
    {id:'not_printed', label:"Ne pas imprimer", default:false}
    ],

  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  last_id: -1,
  
  /**
    *  Table des fiches instanciées
    *  ----------------------------
    *
    * NOTES
    * -----
    *   * En clé, l'identifiant ({Number}), en valeur l'instance de la fiche
    *   * C'est la méthode `create' de la fiche qui la met dans la liste
    *   * Utiliser la méthode `FICHES.get' pour obtenir une fiche de cette liste.
    *
    * @property {Object} list
    *
    */
  list:{},
  
  /**
    * Nombre de fiches dans `list`
    * @property {Number} length
    * @default 0
    */
  length:0,
  
  /*
   *  {Hash} des fiches sélectionnées
   *  
   *  En clé, l'ID de la fiche, en valeur, son instance
   */
  selecteds:{},
  
  /**
    * Fiche courante
    * @property {Fiche} current
    * @default null
    */
  current:null,

  /*
   *  Retourne la fiche ({Fiche>something}) d'identifiant +id+ ou undefined
   *  
   */
  get:function(id)
  {
    if(undefined==id) throw "Il faut fournir l'identifiant de la fiche à retourner";
    var fi = this.list[id]
    // if(undefined==fi) throw "La fiche d'identifiant #"+id+" est inconnue au bataillon";
    return fi
  },
  
  /**
    *  Reçoit un objet DOM de fiche (class fiche) et
    *  retourne la fiche correspondante.
    *
    * @method domObj_to_fiche
    * @param  obj {HTMLDom|jQuerySet} Element Dom appartenant à une fiche ou l'objet
    *             (tag:fiche) de la fiche elle-même.
    * @return {Fiche} L'instance Fiche ({Book}, {Chapter} etc) de la fiche propriétaire
    *         de ce DOM Element.
    *
    */
  domObj_to_fiche:function(obj)
  {
    var fi = this.list[ $(obj).attr('id').split('-')[1] ]
    if(undefined == fi) throw LOCALE.fiche.error['no fiche for dom obj']
    else return fi
  },
  
  /*
   *  Ajoute une fiche instanciée
   *  
   *  NOTE
   *  ----
   *    # Si la fiche existe déjà, on ne l'ajoute pas.
   *
   *  @param  ifiche    Instance Fiche de la fiche instanciée
   *
   */
  add:function(ifiche)
  {
    if(undefined != this.list[ifiche.id]) return
    this.list[ifiche.id] = ifiche
    this.length ++
  },
  
  /*
   *  Supprime une fiche instanciée
   *  
   *  NOTES
   *  -----
   *  # C'est cette méthode qui doit être appelée, pas la propriété `delete' de la fiche 
   *
   *  # Mais dans le processus normal, on appelle '<fiche>.want_delete' qui demande confirmation
   *    de la suppression en demandant aussi si les enfants doivent être supprimés avec la fiche,
   *    ou être gardés.
   *
   *  # La fenêtre de confirmation demande aussi si les enfants doivent être détruits,
   *    ce qui se fera de façon récursive (resultat.kill_children). Si les enfants
   *    ne doivent pas être détruits, on les sort simplement de leur parent.
   *
   */
  remove:function(ifiche, resultat)
  {
    var idm = "FICHES.remove"
    dlog("---> "+idm)
    var detruire_enfants = resultat.kill_children == true
    
    
    // La fiche doit exister
    if(undefined == this.list[ifiche.id]) return
    var ifiche = this.list[ifiche.id]
    var enfants = ifiche.enfants
    ifiche.delete
    if(this.current.id == ifiche.id) this.current = null
    delete this.list[ifiche.id]
    this.length -- ;
    // Si la fiche a un parent
    if(ifiche.parent)
    {
      ifiche.parent.remove_child( ifiche )
    }
    // Si la fiche a des enfants
    if(enfants)
    {
      if (detruire_enfants)
      {
        L(enfants).each(function(ichild){FICHES.remove(ichild,{kill_children:true})})
      }
      else
      {
        L(enfants).each(function(ichild){
          if(ichild.ranged) ichild.unrange
          ichild.parent   = null ; 
          ichild.modified = true ;
        })
      }
    }
    dlog("<- "+idm)
  },
  
  /*
   *  Ajout d'une fiche à la sélection
   *  
   *  NOTES
   *  -----
   *    * Dans tous les cas, la dernière fiche est mise en fiche courante
   *
   *  @param  ifiche    Instance de la fiche à ajouter à la sélection
   *  @param  keep      Si TRUE, on doit garder les sélections courantes
   *                    FALSE par défaut, vrai quand la touche majuscule est
   *                    appuyée.
   */
  add_selected:function(ifiche, keep)
  {
    // console.log("---> add_selected (ifiche #"+ifiche.id+")")
    if(undefined == keep) keep = false
    if(this.current == ifiche) return
    if(this.current && !keep) this.current.deselect
    this.current = ifiche
    if (undefined != this.selecteds[ifiche.id]) return
    
    this.selecteds[ifiche.id] = ifiche
    // Réglage de la captation des touches clavier
    window.onkeypress = keypress_when_fiche_selected_out_textfield
  },
  
  /*
   *  Sauvegarde de toutes les fiches marquées modifiées
   *  
   */
  saving:false,
  save:function(poursuivre)
  {
    this.saving = true
    F.show("Sauvegarde des fiches ("+Collection.modifieds_list.length+" fiches à sauver)", {keep:true})
    this.poursuivre_save = poursuivre
    var fiches = []
    for(var i in Collection.modifieds_list)
    {
      fiches.push(Collection.modifieds_list[i].data)
    }
    if(fiches.length)
    {
      Ajax.send({script:'fiche/save', fiches:fiches}, $.proxy(this.retour_save,this))
    }
    else this.retour_save({ok:true})
  },
  retour_save:function(rajax)
  {
    if(rajax.ok)
    {
      // Si toutes les fiches ont pu être sauvées, on les marque non
      // modifiées
      for(var i in Collection.modifieds_list)
      {
        Collection.modifieds_list[i].modified = false
      }
      delete Collection.modifieds_list
    }
    else
    {
      F.error(rajax.message)
    }
    this.saving = false
    if('function' == typeof this.poursuivre_save) this.poursuivre_save()
  },
  
  
  /**
    * Dispatch des fiches
    *
    * NOTES
    * -----
    *   * Avec le nouveau fonctionnement, il n'y a plus de problème au niveau
    *     des parents ou des enfants. Les fiches sont instanciées à leur première
    *     détection (soit ici, soit dans les enfants/parent des fiches traitées),
    *     puis elles sont ensuites "remplies" avec les données si la fiche est
    *     traitées plus tard ici.
    *   * Par défaut, les fiches sont maintenant créées fermées, donc on doit
    *     passer seulement en revue les fiches qui doivent être ouvertes.
    *   * Cette méthode est appelée à tout chargement de fiches par groupe
    *   * Seule une fiche passant par cette méthode peut voir si `loaded` marqué
    *     true. Toutes les autres fiches sont considérées comme non chargées.
    *
    * PRODUIT
    * -------
    *   * La création de la fiche (toujours, entendu qu'une fiche passant par
    *     ce dispatch a forcément toutes ses données)
    *
    *   * La tenue à jour de `Collection.books'
    *
    * @method dispatch
    * @param  data   {Array} Liste des fiches remontées par `Collection.load.data`
    *
    */
  dispatch:function( data )
  {
    dlog("---> FICHES.dispatch", DB_FCT_ENTER)
    var i = 0, dfiche, ifiche ;
    var first_loading = Collection.loaded == false
    var nombre_fiches = data.length
    var instances = []

    if(first_loading)
    {
      Collection.books = []
    }
    
    // Création des instances de toutes les fiches utiles
    // (même les enfants cachés)
    for( ; i < nombre_fiches; ++i)
    {
      ifiche = this.fiche_from( data[i] )
      ifiche.loaded = true
      instances.push( ifiche )
    }
        
    // Création des fiches sur la table
    L(instances).each(function(instance){
      if(!instance.obj) instance.create
    })
    
    // Réglage de l'indice des livres (en fonction de leur positionnement
    // sur la table)
    Collection.sort_book_from_table
    
    // Rangement des enfants (toujours - ils seront "dérangés" ensuite
    // si la configuration courante le nécessite)
    L(instances).each(function(instance){
      if(instance.has_parent) instance.range
                         else instance.positionne
    })
        
    // Réglage de l'indice des fiches enfants
    L(instances).each(function(instance){
      if(instance.has_children) instance.update_indice_enfants()
    })
    
    // Actualisation de l'affichage des références à la fiche
    L(instances).each(function(instance){
      var rid = instance.type+"-"+instance.id
      if(REFS.list[rid]) get_ref(rid).update
    })
    
    
    dlog("<- FICHES.dispatch", DB_FCT_ENTER)
  },
    
  /*
   *  Bascule entre l'ouverture et la fermeture les fiches
   *  dans +arr+
   *  
   *  @param  arr   {Array} d'instances de fiche ou simple fiche
   *  @param  evt   Event ayant conduit à l'appel de cette méthode
   */
  toggle:function(arr, evt)
  {
    dlog("=> FICHES.toggle")
    if(undefined != arr.opened) arr = [arr]
    this[arr[0].opened ? 'close' : 'open'](arr)
  },
  
  /**
    * Montre la fiche
    *
    * Notes
    * -----
    *   * Cette fonction est appelée principalement un clic sur une référence
    *     dans le texte ou à partir du listing des résultats trouvés lors d'une
    *     recherche. La fiche peut-être chargée ou non, et d'un type indifférent.
    *     La méthode s'arrange dans tous les cas pour la montrer. Ce qui consiste, 
    *     suivant son type, à :
    *       * "highlighter" un livre (clignotement)
    *       * "highlighter" un chapitre après avoir ouvert son livre si nécessaire.
    *       * Ouvrir une page
    *       * Ouvrir la page d'un paragraphe et scroller jusqu'à lui
    *   * La fiche peut ne pas être chargée. Et ses parents non plus s'il s'agit
    *     d'un paragraphe.
    *   * La question se pose de savoir si je fais une méthode ici qui traite tous
    *     les cas où si je fais une méthode propre pour chaque type de fiche.
    *
    * @method show
    * @param  {String|Number} id    Identifiant de la fiche à montrer
    * @param  {String}        type  Type de la fiche à montrer.
    * @param  {Event}         evt   Evènement transmit à la méthode. N'est défini
    *                               que lors de l'appel direct.
    * 
    */
  show:function(id, type, evt)
  {
    if(undefined != evt)
    {
      this.options_show = {
        select: evt.shiftKey,
        open  : evt.altKey
      }
    }
    var fi = this.fiche_from({id:id, type:type})
    fi.show(this.options_show)
  },
  
  /**
    * Ouvre la ou les fiches données en argument
    *
    * Notes
    *   * N'ouvre les fiches que si elles sont construites (`built` = true)
    * @method open
    * @param  {Array|Fiche} arr Liste d'instance Fiche ou Instance Fiche
    *
    */
  open:function(arr)
  {
    if(exact_typeof(arr) != 'array') arr = [arr] ;
    L(arr).each(function(fi){ if(fi.built) fi.open })
  },
  /*
   *  Ferme la ou les fiches données en argument
   *  
   * @param arr   Liste d'instance Fiche ou Instance Fiche
   *
   */
  close:function(arr)
  {
    if(exact_typeof(arr) != 'array') arr = [arr] ;
    L(arr).each(function(fi){ fi.close })
  },
  /*
   *  Charge les fiches données en arguments
   *
   *  @param  fiches    Liste {Array} de {Hash} contenant `id' et `type'  
   *
   *  La méthode appelante doit définir `FICHES.after_load.poursuivre'
   *  Soit une function normale ({Function}) soit un {Object} contenant
   *  {id:<id fiche>, prop:<propriété complexe} (p.e. {id:12, prop:'open'})
   *
   */
  load:function(arr)
  {
    dlog("---> FICHES.load", DB_FCT_ENTER)
    Ajax.send(
      {script:'fiche/load', fiches:arr},
      $.proxy(this.after_load, this)
    )
    dlog("<- FICHES.load", DB_FCT_ENTER)
  },
  /* Retour de la précédente */
  after_load:function(rajax)
  {
    dlog("---> FICHES.after_load", DB_FCT_ENTER)
    if(rajax.ok)
    {
      // On dispatch les fiches remontées
      this.dispatch( rajax.fiches )
      // Méthode ou propriété complexe pour suivre
      // @RAPPEL: Si c'est une propriété complexe qui doit être appelée,
      //          this.after_load.poursuivre est mis à {id:<ID de la fiche visée>, 
      //          prop:<propriété>}
      var fn = this.after_load.poursuivre
      if(     'function'== typeof fn) fn()
      else if('object'  == typeof fn) this.get(fn.id)[fn.prop]
    }
    else F.error(rajax.message)
    dlog("<- FICHES.after_load", DB_FCT_ENTER)
  },
  /*
   *  Range la ou les fiches données en argument
   *  
   */
  range:function(arr)
  {
    dlog("---> FICHES.range", DB_FCT_ENTER)
    if(exact_typeof(arr) != 'array') arr = [arr] ;
    L(arr).each(function(fi){ if(fi.built) fi.range })
    dlog("<- FICHES.range", DB_FCT_ENTER)
  },
  
  /*
   *  Retourne la fiche (ou LES fiches) correspondant à l'objet
   *  +obj+ envoyé, contenant :
   *    - soit 'id' et 'type'
   *    - soit une liste d'objets contenant 'id' et 'type'
   *  La méthode crée les fiches si nécessaire, en fonction de leur type
   *  ou renvoie les fiches déjà créées.
   *  
   */
  fiche:function(obj)
  {
    var i=0, list=[];
    var is_list = 'array' == exact_typeof(obj) ;
    if(!is_list) obj = [obj]
    for(len = obj.length; i<len; ++i) list.push( this.fiche_from( obj[i] ))
    return is_list ?  list : list[0]
  },

  /*
   *  Renvoie la fiche si elle existe ou la crée (entièrement)
   *
   *  NOTES
   *  -----
   *
   *  # La méthode est identique à la précédente mais ne peut recevoir les données
   *    que d'une seule fiche.
   *
   *  # 2 # Les données +data+ sont dispatchées dans la fiche, même lorsqu'elle
   *    existe, sauf si son `loaded` est à true. Cela est utile au chargement : si un 
   *    parent pas encore créé est défini dans une fiche, on le crée "rapidement" 
   *    (simplement avec son id et son type) puis ensuite, quand on traite le parent dans
   *    le chargement, on n'a plus qu'à dispatcher toutes ses données.
   *
   *  @return L'instance Fiche
   *  
   */
  fiche_from:function(data)
  {
    dlog("---> FICHES.fiche_from", DB_FCT_ENTER)
    var idm="[FICHES.fiche_from] ", ifiche ;
    if(undefined != this.list[data.id]){ 
      // => L'instance existe déjà
      ifiche = this.list[data.id]
      if(!ifiche.loaded) ifiche.dispatch( data ) // cf. note #2 ci-dessus
    }
    else
    { 
      // => il faut créer une instance      
      ifiche = this.create_instance_fiche_of_type(data)
    }
    dlog("<- FICHES.fiche_from", DB_FCT_ENTER)
    return ifiche
  },
  // @data  Peut contenir 'id' et 'type' au minimum
  /**
    * Instancie une fiche avec les données `data`.
    *
    * @method create_instance_fiche_of_type
    * @param  {Object} data Contient au mininum `type` pour instancier une nouvelle
    *         fiche de ce type (création) et contient `id` si c'est l'instanciation
    *         d'une fiche existante.
    *
    */
  create_instance_fiche_of_type:function(data)
  {
    if( DL & (DB_FCT_ENTER) )
    { 
      var spec = data.type
      if(data.id) spec += "#"+data.id
      dlog("---> FICHES.create_instance_fiche_of_type ["+spec+"]")
    }
      
      
    switch(data.type)
    {
    case 'book' : return new Book(data)
    case 'chap' : return new Chapter(data)
    case 'page' : return new Page(data)
    case 'para' : return new Paragraph(data)
    }
  },
  
  /**
    * Crée entièrement une nouvelle fiche à partir des +data+
    * transmises.
    *
    * NOTES
    * -----
    *   * Il s'agit d'une toute nouvelle fiche, jamais d'une fiche
    *     existente.
    *   * Pour le moment, la fiche n'est pas marquée modifiée.
    *
    * @method full_create
    * @param  {Object} data Les données pour la nouvelle fiche
    * @param  {Object|Null} options   Les options pour la création
    *   @param {Boolean} options.focus_titre  Si TRUE, on passe le titre en édition
    *   @param {Boolean} options.focus_texte  Si TRUE, on passe le texte en édition (même chose que pour
    *                                         focus_titre, mais pour un paragraphe)
    *   @param {Boolean} options.select       Si TRUE, on sélectionne la fiche
    *   @param {Fiche}  options.after_fiche   Si défini, c'est la fiche après laquelle on doit
    *                                         placer la nouvelle fiche.
    *   @param {Boolean} options.before_fiche Idem, mais en fournissant la fiche après.
    *
    * @return {Fiche} La nouvelle fiche créée
    */
  full_create:function(data, options)
  {
    dlog("---> FICHES.full_create", DB_FCT_ENTER)
    var ifiche = FICHES.create_instance_fiche_of_type(data)
    if(!ifiche.obj) ifiche.create
    if(options)
    {
      // La fiche a été créée à la fin de son parent, il faut la placer
      // à un autre endroit.
      if(options.after_fiche)
      {
        ifiche.set_after( options.after_fiche )
      }
      else if (options.before_fiche)
      {
        ifiche.set_before( options.before_fiche )
      }
      
      if(options.focus_titre)
      {
        ifiche.enable_main_field
      }
      else if(options.select)
      {
        ifiche.select
      }
    }
    dlog("<- FICHES.full_create", DB_FCT_ENTER)
    return ifiche
  },
  
  /*
   *  Suppression d'une fiche de la sélection
   *  
   *  @param  ifiche    Instance de la fiche à retirer de la sélection
   */
  remove_selected:function(ifiche)
  {
    var idm = "FICHES.remove_selected(ifiche:"+ifiche.type_id+")"
    dlog("---> "+idm, DB_FCT_ENTER)
    if(this.current == ifiche) this.current = null
    delete this.selecteds[ifiche.id]
    dlog("<- "+idm, DB_FCT_ENTER)
  },

  /*
   *  Gestionnaire de l'évènement CLICK sur le titre/texte
   *  
   */
  on_click_on_main_field:function(ifiche, evt)
  {
    // dlog("Click sur le titre/texte")
    ifiche.toggle_select(evt) // stop l'event
    if(evt.metaKey)
    {
      ifiche.enable_main_field
    }
    return false
  },
  /*
   *  Retourne true si le champ d'édition courant et celui
   *  donné en argument
   *  
   *  @param  obj   DOM Element jQuery
   *
   */
  current_field_is:function(obj)
  {
    if( ! this.current_text_field ) return false
    return this.current_text_field[0].id == $(obj)[0].id
  },

  /*
   *  Méthode qui change la sélection courante
   *  ----------------------------------------
   *
   *  NOTES
   *  -----
   *    ::  Cette méthode permet de forcer le changement du texte, 
   *        qui dans le cas contraire ne génère pas de onchange quand on
   *        bouge la sélection.
   *  
   */
  set_selection_to:function(new_value)
  {
    Selection.set(FICHES.current_text_field, new_value,{end:true})
    if(this.current_field_is(this.current.main_field)) 
    {
      FICHES.current.onchange_titre_or_texte(FICHES.current_text_field.val())
    }
  }
}

Object.defineProperties(FICHES,{
  /**
    * Initialisation complète des fiches
    *
    * Notes
    * -----
    *   * C'est une propriété complexe (=> à appeler sans parenthèses)
    *   * Elle procède aussi au nettoyage de la table.
    *
    * @method init_all
    */
  "init_all":{
    get:function(){
      this.length     = 0
      this.list       = {}
      this.current    = null
      this.last_id    = -1
      this.selecteds  = {}
      $('section#table').html('')
    }
  },
  
  /**
    * Construit le menu de développement qui sera placé au verso des fiches
    * retournées
    * Notes
    *   * Un seul select est construit, qui est passé de fiche en fiche
    *   * Propriété complexe => appeler sans parenthèses
    *
    * @method build_menu_development
    */
  "build_menu_development":{
    get:function(){
      $('body').append(this.html_menu_development)
      this.menu_development_ready = true
    }
  },
  /** Retourne le code HTML du menu de développement
    * @property {String} html_menu_development
    */
  "html_menu_development":{
    get:function(){
      var c = ""
      c += '<div id="divuniq_menu_development">' +
            '<span class="libelle">Niveau de développement </span>' +
            '<select id="fiche_option-dev" onchange="">';
      c += L(this.DATA_DEV).collect(function(ddev){
        return '<option value="'+ddev.value+'">'+ddev.title+'</option>'
      }).join("")
      c += '</select></div>'
      return c
    }
  },
  
  "current_text_field":{
    get:function(){ return this._current_text_field || false },
    /*
     *  Définit le text field courant (ou rien)
     *  
     *  @param  obj   Soit l'objet jQuery du text-field, soit NULL quand
     *                on en sort.
     */
    set:function(obj)
    {
      var editing = ( obj !== null )
      this._current_text_field = obj
      Collection[editing ? 'disable_save' : 'enable_save']
    }
  }
  
})
