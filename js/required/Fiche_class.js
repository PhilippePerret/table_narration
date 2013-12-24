/**
  * @module Fiche
  */

/**
  *  Class Fiche
  *  -----------
  *
  *  Toutes les instances Book, Page, Chapter et Paragraph héritent d'elle
  *
  *
  *  RAPPELS
  *  -------
  *    * C'est en ajoutant un enfant à une fiche qu'on détermine les propriétés
  *      `parent' et `enfants' des deux fiches concernant.
  *      cf. la méthode "add_enfant".
  *
  * @class  Fiche
  *
  */
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
  this._opened    = false   // cf. propriété complexe `opened'
  /**
    * Indicateur d'édition
    * Cette propriété est mise à TRUE quand le texte (pour un paragraphe) ou
    * le titre (pour autre type de fiche) est en édition (input/textarea au lieu
    * de div)
    * @property {Boolean} edited
    * @default  False
    */
  this.edited     = false
  // this._ranged    = false   // cf. propriété complexe `ranged'
  this.selected   = false
  this.built      = false   // mis à true quand la fiche est construite
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
  /**
    *  Retourne un {Array} des minidata des enfants 
    *
    * @property enfants_as_minidata
    * @type     {Array}
    * @default  []
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
      if(val && !this._modified)
      {
        if(val) Collection.add_modified( this ) ;
      }
      this._modified = val
    },
    get:function(){return this._modified || false }
  },
  
  /**
    * Marque la fiche ouverte ou fermée (ou retourne la propriété)
    * True si la fiche est ouverte, false dans le cas contraire.
    * Notes
    * -----
    *   * La propriété se contente d'ajouter ou de retirer la class 'opened'
    *     à l'objet DOM de la fiche.
    *
    * @property {Boolean} opened
    * @default false
    */
  "opened":{
    get:function(){ return this._opened || false },
    set:function(opened){
      this._opened = opened
      this.obj[opened?'addClass':'removeClass']('opened')
    }
  },
  /**
    * Returne true si la fiche est fermée, false si ouverte
    *
    * @property {Boolean} closed
    * @default  true
    * @readOnly
    */
  "closed":{get:function(){return this.opened == false}},
  
  /**
    * Marque l'élément rangé ou non rangé (ou retourne la propriété ranged)
    *
    * NOTES
    * -----
    *   * La valeur retournée dépend du type de fiche.
    *       * Pour un livre, la valeur est toujours false
    *       * Pour un chapitre ou un paragraphe, dès qu'ils ont un parent,
    *         ils sont toujours rangés.
    *       * Pour un page, dépend de son ouverture / fermeture.
    *
    * @property {Boolean} ranged
    */
  "ranged":{
    get:function(){
      if(this.is_book) return false
      if(this.parent && (this.is_chapter || this.is_paragraph)) return true
      if(this.is_page) return this.parent && this.closed
    }
  },

  /* ---------------------------------------------------------------------
   */
  /**
    * Vérifie si la fiche peut être ouverte
    * Pour être ouverte, la fiche doit être `loaded' et ses enfants doivent
    * l'être aussi.
    *
    * NOTES
    * -----
    *   * Les enfants, dans la fiche, sont toujours des instances Fiche.
    *     (réglées au chargement du parent). C'est leur propriété `loaded'
    *     qui détermine si elles sont chargées ou non.
    *   * On peut appeler la méthode `rend_openable(<poursuivre>)' pour rendre
    *     la fiche ouvrable après le test `<fiche>.is_not_openable'
    *   * Propriété complexe => appeler sans parenthèses
    * @method is_openable
    * @return {Boolean} true si la fiche peut être ouverte, false otherwise.
    *
    */
  "is_openable":{
    get:function(){
      dlog("-> Fiche::is_openable ["+this.type_id+"]", DB_FCT_ENTER)
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
    
  /**
    * Positionne la fiche sur le table en fonction de :
    * - son état ranged ou non
    * - ses top / left
    * Notes
    *   * Propriété complexe => appeler sans parenthèses
    * @method positionne
    */
  "positionne":{
    get:function(){
      if( this.ranged || this.top == null || !this.obj ) return
      this.obj.css({'top':this.top+"px", 'left':this.left+"px"})
    }
  },
  
  /**
    * Création d'une nouvelle fiche
    * -----------------------------
    * 
    * NOTES
    * -----
    *   * Il ne suffit pas de créer la fiche pour qu'elle soit mise en 
    *     sauvegarde. Cela permet de les créer tranquillement lors du chargement
    *     de la collection.
    *     C'est seulement lorsqu'un élément de la fiche aura été modifié (et
    *     notamment le titre ou le texte — paragraph) qu'elle sera prête pour
    *     l'enregistrement.
    *
    * @property {Method} create
    */
  "create":{
    get:function(){
      dlog("---> Fiche::CREATE ("+this.type_id+")", DB_FCT_ENTER)
      this.build
      this.set_values
      dlog("<- Fiche::CREATE ("+this.type_id+")", DB_FCT_ENTER)
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
      // On place les observers
      this.observe
      // On marque la fiche construite
      this.built = true
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
      
      // Rend la fiche draggable
      this.rend_draggable
      
      // Rend ses enfants sortable
      this.div_items.sortable({
        // 'containment' :"fiche."+this.type+" > recto > div.items",
        'axis'        :"y",
        'helper'      :"clone",
        'placeholder' :'newplace',
        'update'      :$.proxy(this.onchange_ordre_enfants, this)
      })
      
      // Un click sur la fiche doit la sélectionner/déselectionner
      // Mais seulement en recto
      this.active_click_on_fiche

      // Le click sur la fiche, en combinaison avec des modifiers,
      // doit entrainer différents résultats (pour le moment, avec 
      // CMD, on met le titre/texte en édition)
      this.main_field.bind('click', $.proxy(FICHES.on_click_on_main_field, FICHES, this))

      if(this.is_book)
      {
        // La modification du titre réel doit entrainer son update
        // obj = this.input_real_titre
        // obj.bind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
        // obj.bind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
        // this.input_real_titre[0].onchange = $.proxy(this.onchange_real_titre, this)
        UI.Input.bind( this.input_real_titre )
      }
      // Toutes les fiches hors paragraphes doivent être droppable et
      // accepter un élément de rang inférieur
      var accepted_child = FICHES.datatype[this.type].child_type
      if(this.is_not_paragraph)
      {
        this.obj.droppable({
          hoverClass  :'dropped',
          tolerance   : 'pointer',
          greedy      : true, // pour empêcher de se propager à la table
          accept      : function(drags){
            // Pour empêcher la propagation
            if(drags.attr('drg_time'))
            {
              return drags.attr('drg_time') == this.drg_time
            }
            if(drags.hasClass('card_tool')) return drags.attr('data-type')==accepted_child
            if(drags.hasClass('fiche')) return drags.hasClass(accepted_child)
            return false
          },
          drop        :$.proxy(this.on_drop, this),
          over        :function(evt,ui){
            ui.draggable.attr('drg_time', this.drg_time = evt.timeStamp)
          },
          out:function(evt,ui){
            // not required but cleaner
            ui.draggable.removeAttr('drg_time')
          }
        })
      }
      dlog("<- " + idm, DB_FCT_ENTER)
      return true
    }
  },
  "active_click_on_fiche":{
    get:function(){
      // this.obj.bind('click', $.proxy(this.toggle_select, this))
      this.recto.bind('click', $.proxy(this.toggle_select, this))
      this.verso.bind('click', function(evt){evt.stopPropagation();return true})
    }
  },
  "desactive_click_on_fiche":{
    get:function(){
      // this.obj.unbind('click', $.proxy(this.toggle_select, this))
      this.recto.unbind('click', $.proxy(this.toggle_select, this))
    }
  },
  /*
   *  Rend la fiche sortable (lorsqu'elle est rangée)
   *  
   */
  "rend_sortable":{
    get:function(){
      // this.div_items.sortable()
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
   *  Rend la fiche "ouvrable"
   *  (en chargeant ses données au besoin et ses enfants)
   *  
   *  @param  poursuivre    SOIT une fonction pour poursuivre, 
   *                        SOIT un {String} qui sera une pseudo-méthode (propriété
   *                        complexe) de la fiche elle-même.
   *                        SOIT un {Object} contenant :
   *                        {id:<id de la fiche>, prop:<propriété complexe>}
   */
  "rend_openable":{
    value:function(poursuivre){
      var idm = "Fiche::rend_openable ["+this.type_id+"]" 
      dlog("---> "+idm, DB_FCT_ENTER)
      if('string' == typeof poursuivre) poursuivre = {id:this.id, prop:poursuivre}
      FICHES.after_load.poursuivre = poursuivre
      FICHES.load( this.enfants_as_minidata )
      dlog("<- "+idm, DB_FCT_ENTER)
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
  
  /* ---------------------------------------------------------------------
   *  MÉTHODES POUR COPIER/COUPER/COLLER LES ENFANTS
   --------------------------------------------------------------------- */
  /**
    * Copie la fiche
    * Notes
    *   * En réalité, la "copie" de la fiche ne consiste qu'à mettre sa référence
    *     dans App.clipboard
    *   * On reconnait une fiche coupée d'une fiche copiée au 'cuted' qui est 
    *     ajouté quand on coupe la fiche.
    * @property {Method} copy
    */
  "copy":{
    get:function(){
      F.show("Je COPY la fiche courante"+this.type_id)
      App.clipboard = this
      F.show("La fiche "+this.human_type+" a été copiée.\nSélectionne un nouveau parent pour la coller à l'aide de "+
      image('clavier/K_Command.png')+image('clavier/K_V.png'))
    }
  },
  /**
    * Coupe la fiche
    * Notes
    *   * En réalité, la "coupe" de la fiche ne consiste qu'à mettre sa référence
    *     dans App.clipboard en mettant son cuted à true et en masquant son objet
    *     dans le DOM (pour ne pas avoir à le reconstruire.)
    *
    * @property {Method} cut
    */
  "cut":{
    get:function(){
      F.show("Je CUT la fiche "+this.type_id)
      App.clipboard = this
      App.clipboard.cuted = true
      this.obj.hide()
      F.show("La fiche "+this.human_type+" a été coupée.\nSélectionne un nouveau parent pour la coller à l'aide de "+
      image('clavier/K_Command.png')+image('clavier/K_V.png')+
      "\nNoter que tant que la fiche n'a pas été collée, elle n'est pas retirée du parent courant.")
    }
  },
  /**
    * Colle la fiche
    * Notes
    *   * Pour coller la fiche copiée/coupée, il faut qu'un parent ou un frère
    *     potentiel soit sélectionné. Si c'est un parent, on ajoute la fiche à la
    *     fin. Sinon, on l'ajoute avant le parent sélectionné.
    *   * Si la fiche avait été copiée, il faut reconstruire une fiche de toute pièce
    *     en se servant des informations de la fiche copiée. Si au contraire la fiche
    *     a été coupée, il faut la sortir de son parent et la remettre dans le nouveau.
    *
    * TODO: Pour le moment, on ne peut pas coller une fiche sur la table, mais on
    * devrait pouvoir le faire.
    *
    * @property {Method} paste
    */
  "paste":{
    get:function(){
      try
      {
        if(!App.clipboard) throw 'no copied fiche'
        if(App.clipboard.class != "Fiche") throw 'no fiche in clipboard'
        if(App.clipboard.type != this.child_type && App.clipboard.type != this.type) 
          throw 'bad child type in clipboard'
        if(App.clipboard.type == this.type){
          if(!this.parent) throw 'no parent for clipboarded fiche'
          if(App.clipboard.cuted && App.clipboard.parent == this.parent)
            throw 'clipboarded fiche already in parent'
        }
        else if (App.clipboard.type == this.child_type){
          if(App.clipboard.cuted && App.clipboard.parent == this)
            throw 'clipboarded fiche already in parent'
        }
          
      }
      catch(err_id){return F.error(LOCALE.fiche.error[err_id])}

      // === La fiche peut être collée ===
      // @note : si elle appartient à un parent, il faut la retirer de ce parent.
      // - Si la fiche est "not cuted", il faut créer une autre fiche d'après
      //   les données de la fiche copiée (et remettre le copied de la fiche à false)
      // - Si la fiche est 'cuted=true', il faut 1/ la sortir de son parent, 2/
      //    l'injecter dans le parent courant et 3/ remettre son obj à display=block
      //    pour le faire ré-apparaitre
      var new_parent, beforeChild ;
      if(App.clipboard.type == this.child_type)
      {
        // La fiche sélectionnée (courante) est le nouveau parent de la fiche
        // Il faut placer la fiche copiée/coupée au bout du parent
        new_parent = this
      }
      else
      {
        // La fiche sélectionnée est le nouveau frère (cadet) de la fiche
        // copiée/coupée
        new_parent  = this.parent
        beforeChild = this
      }

      if(App.clipboard.cuted)
      {
        // Fiche coupée
        fiche = App.clipboard
        fiche.parent.remove_child( fiche )
      }
      else
      {
        // Fiche copiée => la cloner
        var data = {}
        var props = [ // mettre ici les propriétés à cloner
          'type'
          ]
        switch(App.clipboard.type)
        {
        case 'book':
          props.push('real_titre')
          break
        case 'para':
          props.push('texte')
          props.push('ptype')
        }
        if(App.clipboard.type!='para') props.push('titre')
        L(props).each(function(prop){ data[prop] = App.clipboard[prop]})
        fiche = FICHES.full_create(data)
        fiche.modified = true
      }
      
      // Si la fiche est pastée dans un parent (sinon, elle reste sur la table)
      if(new_parent)
      {
        new_parent.add_child( fiche, {before:beforeChild})
        if(fiche.cuted)
        {
          fiche.obj.show()
          delete fiche.cuted
        } 
      }
      
      // À la fin, il faut détruire le clipboard
      delete App.clipboard
      Flash.clean()
    }
  }
  
})

/**
  * Appelé quand on relâche un enfant sur la fiche courante
  *  
  * @method on_drop
  * @param   {Event} evt   L'évènement drop
  * @param   {jQuerySet} ui    
  *          L'objet déplacé (ui.element est l'original)
  *               Note : l'original peut être soit une fiche réelle, soit
  *               un card-tool. Lorsque c'est une card-tool, il faut créer la
  *               nouvelle fiche.
  */
Fiche.prototype.on_drop = function(evt, ui)
{
  stop_event(evt)
  var idm = "Fiche::on_drop ["+this.type_id+"]"
  dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT )
  UI.drop_on_fiche = true
  
  var obj_moved = ui.draggable
  var ichild
  var is_tool   = obj_moved.hasClass('card_tool') ;
  
  if(is_tool)
  {
    // On crée la fiche
    var data = {
      type: obj_moved.attr('data-type'),
      left: 100, top: 100
    }
    var dtype = FICHES.datatype[data.type]
    data[data.type == 'para' ? 'texte' : 'titre'] = dtype.defvalue
    
    // L'attribut drg_time reste parfois dans l'outil, ce qui empêche ensuite
    // de le dragguer sur un parent. On supprime toujours cette attribut ici
    obj_moved.removeAttr('drg_time')
    
    // On crée entièrement la fiche
    ichild = FICHES.full_create(data)
  }
  else
  {
    ichild = FICHES.domObj_to_fiche( obj_moved )
  }
  this.add_child( ichild )
  
  // Si cette fiche parent est fermée, il faut l'ouvrir
  if(false == this.opened) this.open
  
  // TODO: Plus tard, on pourra regarder si la fiche a été déposé à un
  // endroit précis, pour le placer au bon endroit dans les enfants
  // F.error("La méthode Fiche.on_drop doit être implémentée"+
  // "\nÉlément #"+obj_moved.attr('id')+" (outil ? "+is_tool+") glissé sur fiche #"+this.id)
  
  // Si c'est une création, on met aussi l'enfant en édition
  if(is_tool) ichild.enable_main_field
  
  return stop_event( evt )
}

$.extend(Fiche.prototype,{
  
  /**
    * Appelé quand on change l'ordre des enfants de la fiche, soit par le
    * sortable du div_items, soit par `move_up` ou `move_down` d'un des
    * enfant.
    *
    * NOTES
    * -----
    *   * Plutôt que de s'embêter à étudier +ui+ pour savoir quel
    *     élément a été déplacé, on compare la liste du DOM avec la liste des
    *     enfants et on commence à traiter à partir de cet indice.
    *   * Les deux arguments ne sont pas définis lorsque la méthode est appelée
    *     depuis `move_up` et `move_down`.
    *
    * @method onchange_ordre_enfants
    * @param  evt {Event}   UpdateEvent généré par sortable
    * @param  ui  {Object}  L'objet envoyé par jquery
    *
    */
  onchange_ordre_enfants:function(evt, ui)
  {
    stop_save
    dlog("onchange_ordre_enfants sur la fiche "+this.type_id + " : " + this.titre)
    var sorted_id, sorted_ids = 
      L(this.div_items.sortable('toArray')).
      collect(function(domid){ return parseInt(domid.split('-')[1],10)})
    
    this.enfants = []
    while(sorted_id = sorted_ids.shift()) this.enfants.push(get_fiche(sorted_id))
    this.update_indice_enfants()
    this.modified = true
    restart_save
  },
  
  /*
    * Actualise l'indice des enfants à partir de +from+
    *
    * NOTES
    * -----
    *   * L'indice des enfants (0-start) est une propriété volatile
    *     utile à quelques méthodes, par exemple l'insertion d'enfants
    *     à un endroit précis.
    *
    * @method update_indice_enfants
    * @param [from=0] {Number} from  Indice de départ
    */
  update_indice_enfants:function(from)
  {
    if(undefined == from) from = 0
    for(var ichild = from, len=this.enfants.length; ichild<len; ++ichild)
    {
      this.enfants[ichild].indice = parseInt(ichild, 10)
    }
  },
  
  /**
    * Ajout d'un enfant à la fiche
    *
    * NOTES
    * -----
    *   * C'est cette méthode qui doit être utilisée pour tout ajout
    *     d'enfant.
    *
    * @method add_child
    * @param  enfant    {Fiche} de l'enfant à ajouter
    * @param  options   {Object} Options d'insertion :
    *   @param  {Fiche} options.after  Ajouter après cet enfant
    *   @param  {Fiche} options.before Ajouter avant cet enfant
    */
  add_child:function(enfant, options)
  {
    var idm = "Fiche::add_child("+enfant.type+":"+enfant.id+") ["+this.type_id+"]"
    dlog("-> "+idm, DB_FCT_ENTER | DB_CURRENT)
    if(undefined == options) options = {}
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
    if(this.enfants == null)
    {
      enfant.indice = 0
      this.enfants  = [enfant]
    } 
    else
    {
      if(options.after || options.before){
        var indice = options.after ? options.after.indice + 1 : options.before.indice
        this.enfants.splice(indice, 0, enfant)
        this.update_indice_enfants(from = indice)
      }
      else {
        enfant.indice = this.enfants.length
        this.enfants.push( enfant )
      }
    }
  
    // Définition du parent de l'enfant
    enfant.parent = this
  
    if(enfant.opened) enfant.close
  
    /*
     *  Placement de l'objet DOM
     *  
     */
    if(options.after)
    { 
      enfant.obj.insertAfter( options.after.obj )
    }
    else if(options.before)
    { // => Ajout avant l'enfant before_child
      enfant.obj.insertBefore( options.before.obj )
    }
    else {
      this.div_items.append( enfant.obj )
    }
  
  
    this.modified   = true
    enfant.ranged   = true
    enfant.obj.addClass('ranged')
    enfant.modified = true
    
  },
  
  /**
    *  Supprime un enfant de la fiche
    *  
    * @method remove_child
    * @param  {Fiche} enfant  L'enfant à retirer.
    *
    */
  remove_child:function(enfant)
  {
    try
    {
      // L'enfant doit être du bon type
      if('object' != typeof enfant || enfant.class != 'Fiche') throw 'child should be a fiche';

      // On va vérifier que l'enfant soit bien celui qu'il prétend être
      if(enfant.parent != this) throw 'is not child'
      var childcheck = this.enfants[enfant.indice]
      if(childcheck != enfant) throw 'is not child'
    }
    catch(err){ throw LOCALE.fiche.error[err] }
  
    this.enfants.splice(enfant.indice, 1)
    enfant._parent = null

    this.modified   = true
    enfant.modified = true

    // Actualisation de l'indice des enfants suivants
    this.update_indice_enfants(from = enfant.indice)
    
    // On peut retirer l'enfant de la liste
    if(enfant.ranged == false) enfant.range
    $('section#table').append( enfant.obj )
    enfant.positionne
    
  },
  
  /**
    * Méthode appelée quand on change le texte (paragraphe) ou le titre (autres
    * fiches) d'une fiche.
    *
    * NOTES
    * -----
    *   * La méthode interdit d'enregistrer une donnée vide.
    *   * Cela peut se produire lorsqu'on quitte le champ, ou lorsque
    *     l'on presse la touche RETURN sur le champ.
    *   * C'est vraiment cette fonction qui inaugure le changement du
    *     titre, car si c'était `titre=` (propriété complexe), on aura
    *     une difficulté à la définition des fiches remontées.
    *
    *
    * @method onchange_texte
    * @param  {Event} evt   L'Onchange Event.
    * @return {True} si la donnée a été prise en compte, {False} dans le cas contraire.
    */
  onchange_titre_or_texte:function(evt)
  {
    var idm = "Fiche::onchange_titre_or_texte ["+this.type_id+"]"
    dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
    var obj=this.main_field, prop=this.main_prop ;
    var new_value = obj.val().trim()
    new_value = this.value_by_ptype( new_value )
    if(new_value == "") return F.error(LOCALE.fiche.error['no empty text'])
    if(this[prop] != new_value)
    {
      this[prop]    = new_value
      this.modified = true    
    }
    if(this.is_chapter) this.close
    dlog("<- "+idm, DB_FCT_ENTER)
    return true
  },
  
  /**
    * Traite la nouvelle valeur du paragraphe (si c'est un paragraphe) en
    * fonction de son ptype. Pour le moment, la méthode se contente de transformer
    * les `**' en retours chariot dans les paragraphes de ptype 'list' et 'code'
    * @method value_by_ptype
    * @param  {String} value  La valeur à traiter
    * @return {String} la nouvelle valeur au besoin
    */
  value_by_ptype:function(value)
  {
    if(this.is_not_paragraph) return value
    if(this.ptype == 'list' || this.ptype == 'code')
    {
      value = value.split('**')
      value = L(value).collect(function(line){ return line.trim() }).join("\n")
    }
    return value
  }
  
})


/**
  * Invoquée à la fin du drag d'une fiche, cette méthode enregistre la nouvelle
  * position de la fiche, la place sur la grille si les préférences l'exigent et
  * indique que la fiche a été modifiée.
  *  
  * Notes
  * -----
  *   * C'est la préférence `App.preferences.snap` qui détermine s'il faut placer
  *     la fiche sur la grille (true par défaut)
  *
  * @method stop_drag
  * @param  {Event} evt DragStopEvent déclenché.
  * @param  {jQuery.ui} L'objet jQuery ayant déclenché le drag.
  *
  */
Fiche.prototype.stop_drag = function(evt, ui){
  var pos = this.obj.position()
  dlog("-> Fiche::stop_drag", DB_FCT_ENTER | DB_CURRENT)
  dlog("App.preferences.snap:"+App.preferences.snap)
  pos_on_grid = UI.position_on_grid([pos.left, pos.top], App.preferences.snap)
  this.left = pos_on_grid.left
  this.top  = pos_on_grid.top
  this.positionne
  this.modified = true
  // return stop_event(evt) // Car ça interromprait la procédure
}
