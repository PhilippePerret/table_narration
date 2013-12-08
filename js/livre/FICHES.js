/*
 *  Objet Pluriel FICHES
 *  --------------------
 *
 */
window.FICHES = {
  
  /*
   *  CONSTANTES
   *  
   */
  datatype:{
    'para'  : {level: 5 , defvalue: "TEXTE_PARAGRAPHE", child_type:null,    parent_type:'page', hname:"paragraphe"},
    'page'  : {level: 10, defvalue: "TITRE_PAGE",       child_type:'para',  parent_type:'chap', hname: "page"},
    'chap'  : {level: 15, defvalue: "TITRE_CHAPITRE",   child_type:'page',  parent_type:'book', hname: "chapitre"},
    'book'  : {level: 20, defvalue: "TITRE_LIVRE",      child_type:'chap',  parent_type:null,   hname: "livre"}
    },

  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  last_id: -1,
  
  /*
   *  List {Hash} des fiches instanciées
   *  ----------------------------------
   *  En clé, l'identifiant ({Number}), en valeur l'instance de la fiche
   *
   *  C'est la méthode `create' de la fiche qui la met dans la liste
   *
   */
  list:{},
  /*
   *  Nombre de fiches dans `list'
   */
  length:0,
  
  /*
   *  {Hash} des fiches sélectionnées
   *  
   *  En clé, l'ID de la fiche, en valeur, son instance
   */
  selecteds:{},
  
  /*
   *  Fiche courante (instance Fiche)
   *  
   */
  current:null,

  /*
   *  Indique si on se trouve dans un champ de saisie (input-text ou textarea)
   *  de la fiche courante.
   *  (Mais c'est une propriété complexe qui empêche d'enregistrer le livre
   *   pendant l'édition)
   */
  // current_text_field:false,
  
  /*
   *  Retourne la fiche ({Fiche>something}) d'identifiant +id+
   *  
   */
  get:function(id)
  {
    if(undefined==id) throw "Il faut fournir l'identifiant de la fiche à retourner";
    var fi = this.list[id]
    if(undefined==fi) throw "La fiche d'identifiant #"+id+" est inconnue au bataillon";
    return fi
  },
  
  /*
   *  Reçoit un objet DOM de fiche (class fiche) et
   *  retourne la fiche correspondante.
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
    dlog("-> "+idm)
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
    // console.log("-> add_selected (ifiche #"+ifiche.id+")")
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
    this.poursuivre_save = poursuivre
    var fiches = []
    for(var i in Collection.modifieds_list)
    {
      fiches.push(Collection.modifieds_list[i].data)
    }
    Ajax.send({script:'fiche/save', fiches:fiches}, $.proxy(this.retour_save,this))
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
  
  
  /*
   *  Dispatch des fiches
   *
   *  NOTES
   *  -----
   *    # Avec le nouveau fonctionnement, il n'y a plus de problème au niveau
   *      des parents ou des enfants. Les fiches sont instanciées à leur première
   *      détection (soit ici, soit dans les enfants/parent des fiches traitées),
   *      puis elles sont ensuites "remplies" avec les données si la fiche est
   *      traitées plus tard ici.
   *    # Par défaut, les fiches sont maintenant créées fermées, donc on doit
   *      passer seulement en revue les fiches qui doivent être ouvertes.
   *
   *  PRODUIT
   *  -------
   *    # La création de la fiche (toujours, entendu qu'une fiche passant par
   *      ce dispatch a forcément toutes ses données)
   *
   *  @param  data   {Array} Liste des fiches remontées par Collection.load.data  
   */
  dispatch:function( data )
  {
    dlog("-> FICHES.dispatch", DB_FCT_ENTER)
    var openeds = [], closeds = [], rangeds = [] ;
    var i, len, dfiche, ifiche ;
    // dlog("*** Data envoyées à FICHES.dispatch ***")
    // dlog(data)
    for(i=0, len = data.length; i<len; ++i)
    {
      ifiche = this.fiche_from( data[i] )
      if(data[i]['opened'] == "true" ) openeds.push( ifiche )
      if(data[i]['opened'] == "false") closeds.push( ifiche )
      if(data[i]['ranged'] == "true" ) rangeds.push( ifiche )
      ifiche.loaded = true // Une fiche passant par ici est forcément chargée
      ifiche.create
    }
    
    // this  .close (closeds)
    this  .open  (openeds)
    this  .range (rangeds)
    // console.log(rangeds)
    
    dlog("<- FICHES.dispatch", DB_FCT_ENTER)
  },
  
  /*
   *  Ouvre la ou les fiches données en argument
   *
   * @param arr   Liste d'instance Fiche ou Instance Fiche
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
    dlog("-> FICHES.load", DB_FCT_ENTER)
    console.log(arr)
    Ajax.send(
      {script:'fiche/load', fiches:arr},
      $.proxy(this.after_load, this)
    )
    dlog("<- FICHES.load", DB_FCT_ENTER)
  },
  /* Retour de la précédente */
  after_load:function(rajax)
  {
    dlog("-> FICHES.after_load", DB_FCT_ENTER)
    if(rajax.ok)
    {
      // On dispatch les fiches remontées
      this.dispatch( rajax.fiches )
      // Méthode (ou propriété complexe) pour suivre
      var fn = this.after_load.poursuivre
      dlog(fn)
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
    dlog("-> FICHES.range", DB_FCT_ENTER)
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
    dlog("-> FICHES.fiche_from", DB_FCT_ENTER)
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
  create_instance_fiche_of_type:function(data)
  {
    dlog("-> FICHES.create_instance_fiche_of_type ["+data.type+"#"+data.id+"]", DB_FCT_ENTER)
    switch(data.type)
    {
    case 'book' : return new Book(data)
    case 'chap' : return new Chapter(data)
    case 'page' : return new Page(data)
    case 'para' : return new Paragraph(data)
    }
  },
  
  /*
   *  Crée entièrement une nouvelle fiche à partir des +data+
   *  transmises.
   *
   *  NOTES
   *  -----
   *    @ Il s'agit d'une toute nouvelle fiche, jamais d'une fiche
   *      existente.
   *    @ Pour le moment, la fiche n'est pas marquée modifiée.
   *  
   *  @param  data    {Hash} Les données pour la nouvelle fiche
   *  @param  options {Hash} Les options.
   *                    focus_titre   Si TRUE, on focuse dans le titre
   *                    select        Si TRUE, on sélectionne la fiche
   *
   *  @return La nouvelle fiche créée
   */
  full_create:function(data, options)
  {
    dlog("-> FICHES.full_create", DB_FCT_ENTER)
    var ifiche = FICHES.create_instance_fiche_of_type(data)
    ifiche.create
    if(options)
    {
      if(options.focus_titre)
      {
        var focuson = ifiche.is_paragraph?'input_texte':'input_titre';
        ifiche[focuson].select() // sélectionne aussi la fiche (est-ce bien ?)
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
    if(this.current == ifiche) this.current = null
    delete this.selecteds[ifiche.id]
    window.onkeypress = keypress_when_no_selection_no_edition
  },
  
  /*
   *  Double-click sur une fiche fermée
   *  
   *  PRODUIT
   *  -------
   *    # Ouvre la fiche
   *    # Focusse sur le titre ou le texte si paragraphe, mais sous
   *      certaines conditions (si aucun enfants pour le moment)
   *
   *  @param  ifiche    Instance Fiche de la fiche double-cliquée
   *  @param  evt       Event Dblclick
   */
  on_dblclick:function(ifiche, evt)
  {
    ifiche.open
    if(ifiche.is_paragraph) ifiche.input_texte.select()
    else if (!ifiche.enfants) ifiche.input_titre[0].focus()
  },
  
  /*
   *  Méthode appelée quand on focuse/blure dans n'importe quel champ de
   *  saisie de la fiche
   *  
   */
  onfocus_textfield:function(ifiche, evt)
  {
    // console.log("-> onfocus_textfield dans " + evt.target.id)
    // @note: Il est important de sélectionner la fiche avant tout autre
    // réglage pour que la sélection qui serait appelée ensuite (quand on clique
    // dans le champ de saisie alors que la fiche n'est pas sélectionnée) ne
    // remette par la méthode de gestion des touches clavier à ..._out_textfield
    ifiche.select
    window.onkeypress = keypress_when_fiche_selected_in_textfield
    var target = $(evt.currentTarget)
    target.addClass('focused')
    target.select()
    this.current_text_field = target // complex
  },
  onblur_textfield:function(ifiche, evt)
  {
    // console.log("-> onblur_textfield de " + evt.target.id)
    $(evt.target).removeClass('focused')
    if(this.current) window.onkeypress = keypress_when_fiche_selected_out_textfield
    else window.onkeypress = keypress_when_no_selection_no_edition
    this.current_text_field = null // complex
  }
}

Object.defineProperties(FICHES,{
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
      Collection.saving_forbidden = editing
      this._current_text_field = obj
      if(editing)
      {
        Collection.stop_automatic_saving
      }
      else
      {
        Collection.start_automatic_saving
      }
    }
  }
  
})
