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
    'para'  : {level: 5 , child_type:null},
    'page'  : {level: 10, child_type:'para'},
    'chap'  : {level: 15, child_type:'page'},
    'book'  : {level: 20, child_type:'chap'}
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
   *  
   */
  in_text_field:false,
  
  /*
   *  Ajoute une fiche instanciée
   *  
   *  NOTE
   *  ----
   *
   *  @param  ifiche    Instance Fiche de la fiche instanciée
   *
   */
  add:function(ifiche)
  {
    // La fiche ne doit pas encore exister
    if(undefined != this.list[ifiche.id]) return
    this.list[ifiche.id] = ifiche
    this.length ++
  },
  
  /*
   *  Supprime une fiche instanciée
   *  
   */
  remove:function(ifiche)
  {
    // La fiche doit exister
    if(undefined == this.list[ifiche.id]) return
    delete this.list[ifiche.id]
    this.length --
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
   *    * Avec le nouveau fonctionnement, il n'y a plus de problème au niveau
   *      des parents ou des enfants. Les fiches sont instanciées à leur première
   *      détection (soit ici, soit dans les enfants/parent des fiches traitées),
   *      puis elles sont ensuites "remplies" avec les données si la fiche est
   *      traitées plus tard ici.
   *
   *  @param  data   {Array} Liste des fiches remontées par Collection.load.data  
   */
  dispatch:function(data)
  {
    var i, len, dfiche, ifiche ;
    for(i=0, len = data.length; i<len; ++i)
    {
      ifiche = this.fiche_from( data[i] )
      ifiche.create
      ifiche.modified = false 
        // au cas où (mais est-ce suffisant ? car si la fiche a été marquée
        // modifiée, elle se trouvera dans la liste des fiches à sauver)
      if(ifiche.id > this.last_id) this.last_id = ifiche.id
    }
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
    var i ;
    var is_list = 'array' == exact_typeof(obj) ;
    if(is_list)
    {
      var list = [] ;
      for(i=0, len = obj.length; i<len; ++i)
      {
        list.push( this.fiche_from( obj[i] ))
      }
      return list
    }
    else
    {
      return this.fiche_from(obj)
    }
  },
  // Identique à la précédente, mais ne reçoit qu'un objet contenant
  // au moins 'id' et 'type'
  // Retourne la fiche correspondante ou l'instance créée
  // @note: Les +data+ envoyées sont entièrement dispatchées, même si
  // la fiche existe déjà.
  fiche_from:function(data)
  {
    if(undefined != this.list[data.id]){ 
      var ifiche = this.list[data.id]
      ifiche.dispatch( data ) // au cas où d'autres données sont fournies
      return ifiche
    }
    else
    { // => il faut créer une instance
      return this.create_instance_fiche_of_type(data)
    }
  },
  // @data  Peut contenir 'id' et 'type' au minimum
  create_instance_fiche_of_type:function(data)
  {
    switch(data.type)
    {
    case 'book' : return new Book(data);      break;
    case 'chap' : return new Chapter(data);   break;
    case 'page' : return new Page(data);      break;
    case 'para' : return new Paragraph(data); break;
    }
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
    this.in_text_field = true
  },
  onblur_textfield:function(ifiche, evt)
  {
    // console.log("-> onblur_textfield de " + evt.target.id)
    $(evt.target).removeClass('focused')
    if(this.current) window.onkeypress = keypress_when_fiche_selected_out_textfield
    else window.onkeypress = keypress_when_no_selection_no_edition
    this.in_text_field = false
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
  }
  
})
