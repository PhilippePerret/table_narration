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
  this.class      = "Fiche"
  this.id         = null
  this.created_at = null
  this.type       = null      // le type, entre 'book', 'page', 'chap', 'para'
  
  // --- State ---
  // (ci-dessous les valeurs par défaut)
  this.loaded     = false   // Mis à true si elle est entièrement chargée
  this.deleted    = false
  this.opened     = true
  this.ranged     = false
  this.selected   = false
  this.built      = false  // mis à true quand la fiche est construite
  this.retourned  = false
  
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
}

Object.defineProperties(Fiche.prototype, {
  
  "modified":{
    set:function(val){ 
      this._modified      = val;
      if(val) Collection.add_modified( this ) ;
    },
    get:function(){return this._modified || false }
  },

  "type":{
    get:function(){ return this._type || null},
    set:function(ty){ this._type = ty }
  },
  
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
  
  /* Champ de saisie du titre */
  "titre_jid":{get:function(){return 'input#'+this.dom_id+'-titre'}},
  "input_titre":{
    get:function(){
      if(!this._input_titre || this._input_titre.length == 0) this._input_titre = $(this.titre_jid);
      return this._input_titre
    }
  },
  
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
   *  
   *  “Créer la fiche” consiste à :
   *    - mettre la fiche en attente de sauvegarde
   *    - créer son objet sur la table
   */
  "create":{
    get:function(){
      this.modified = true
      this.build
      this.open
      this.set_values
      return true
    }
  },
  
  /*
   *  Construction de la fiche sur la table
   *  
   */
  "build":{
    get:function(){
      // On ajoute le code ou on le remplace
      if(this.obj) this.obj.replaceWith( this.html )
      else         $('section#table').append( this.html )
      // Elle est toujours construite fermée
      this.close
      // On positionne la fiche
      this.positionne
      // On place les observers
      this.observe
      // On marque la fiche construite
      this.built = true
      return true
    }
  },
  
  /*
   *  Place tous les OBSERVERS sur la fiche
   *  
   */
  "observe":{
    get:function(){
      // On doit la rendre draggable
      this.obj.draggable({containment:'parent'})
      // Le click sur la fiche doit activer sa sélection
      this.obj.bind('click', $.proxy(this.toggle_select, this))
      if(this.is_paragraph)
      {
        // La modification du texte du paragraphe doit provoquer son
        // actualisation
        this.input_texte[0].onchange = $.proxy(this.onchange_texte, this)
      }
      else
      {
        // La modification du titre doit entrainer son actualisation
        // this.input_titre.bind('onchange', $.proxy(this.onchange_titre, this))
        this.input_titre[0].onchange = $.proxy(this.onchange_titre, this)
        
        if(this.is_book)
        {
          // La modification du titre réel doit entrainer son update
          this.input_real_titre[0].onchange = $.proxy(this.onchange_real_titre, this)
        }
      }
      // Tous focus/blur dans les champs d'édition doivent entraîner la
      // gestion propre des touches clavier
      var l = ['input[type="text"]', 'textarea']
      for(var i in l)
      {
        this.obj.find(l[i]).bind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
        this.obj.find(l[i]).bind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
      }
      
      // Toutes les fiches hors paragraphes doivent être droppable et
      // accepter un élément de rang inférieur
      var accepted_child = FICHES.datatype[this.type].child_type
      if(this.is_paragraph == false)
      {
        this.obj.droppable({
          hoverClass  :'dropped',
          accept      : '.fiche.'+accepted_child+
                        ', .card_tool[data-type="'+accepted_child+'"]',
          drop        :$.proxy(this.on_drop, this)
        })
      }
      return true
    }
  },
    
  /*
   *  Ouvre la fiche
   *  
   */
  "open":{
    get:function(){
      this.obj.addClass('opened')
      this.opened = true
    }
  },
  /*
   *  Ferme la fiche
   *  
   */
  "close":{
    get:function(){
      this.obj.removeClass('opened')
      this.opened = false
    }  
  },
  
  /*
   *  Met les valeurs de la fiche dans la fiche DOM
   *  
   */
  "set_values":{
    get:function(){
      this.input_titre.val(this.titre || "TITRE")
      if(this.is_book) this.input_real_titre.val(this.real_titre || "TITRE RÉEL")
      if(this.is_paragraph) this.input_texte.val(this.texte || "TEXTE_PARAGRAPHE")
      return true
    }
  },
  
  
  /*
   *  Retourne la fiche
   *  
   */
  "retourne":{
    configurable:true,
    get:function()
    {
      this.recto[this.retourned ? 'show' : 'hide']()
      this.verso[this.retourned ? 'hide' : 'show']()
      this.retourned = !this.retourned
    }
  },
  
  /*
   *  Retourne le code HTML pour la fiche
   *  
   */
  "html":{
    configurable:true,
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
    configurable:true,
    get:function(){
      return  '<recto id="'+this.dom_id+'-recto" class="'+this.type+'">'+
              this.html_input_titre + // + champ 'real_titre' pour Book
              this.html_div_items   + // textarea.texte pour un paragraphe
              '</recto>'
    }
  },
  
  /* Retourne le code HTML pour le titre de la fiche (sauf paragraphe) */
  "html_input_titre":{
    configurable:true,
    get:function(){
      if(this.is_paragraph) return ""
      var c = '<input type="text" value="" id="'+this.dom_id+'-titre" class="titre" />'
      if(this.is_book) c += '<input type="text" value="" id="'+this.dom_id+'-real_titre" class="real_titre" />'
      return c
    }
  },
  
  /* Retourne le code HTML pour le div des items de la fiche (sauf paragraphe) */
  "html_div_items":{
    configurable:true,
    get:function(){
      if(this.is_paragraph) 
        return '<textarea id="'+this.dom_id+'-texte" class="texte"></textarea>'
      else
        return '<div id="'+this.dom_id+'-items" class="items"></div>'
    }
  },
  
  /*
   *  Retourne le code HTML du VERSO de la fiche
   *  
   */
  "html_verso":{
    configurable:true,
    get:function(){
      return  '<verso id="'+this.dom_id+'-verso" class="'+this.type+'" style="display:none;">'+
              '</verso>'
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
          var child = this.enfants[i]
          data.enfants.push({id:child.id, type:child.type})
        }
      }
      if(this.is_book) data.real_titre = this.real_titre
      if(this.is_paragraph) data.texte = this.texte
      return data
    }
  },
  /*
   *  Destruction totale d'une fiche
   *  
   */
  "remove":{
    configurable:true,
    get:function(){
      // TODO: Implémenter le traitement complexe (appartenances, etc.)
      this.obj.remove()
      this.delete ;
    }
  },
  
  /*
   *  Suppression d'une fiche
   *  
   */
  "delete":{
    configurable:true,
    get:function(){
      this.deleted  = true
      FICHES.remove( this )
      this.modified = true
    }
  },
  
  /*
   *  ---------------------------------------------------------------------
   *    Changement d'état
   *  
   */
  /* Sélection et désélection de la fiche 
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
  
  "is_book"       :{get:function(){ return this.type == 'book'}},
  "is_chapter"    :{get:function(){ return this.type == 'chap'}},
  "is_page"       :{get:function(){ return this.type == 'page'}},
  "is_paragraph"  :{get:function(){ return this.type == 'para'}},

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
  
  "enfants":{
    get:function(){ return this._enfants },
    set:function(children){ this._enfants = children }
  },

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
      this._left = left
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
      this._top = top
      if( !this.ranged ) this.positionne
    }
  }
  
  
})

/*
 *  Appelé quand on droppe un enfant sur la fiche courante
 *  
 */
Fiche.prototype.on_drop = function(evt, ui)
{
  console.dir(ui.helper)
  F.error("La méthode Fiche.on_drop doit être implémentée")
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
  enfant.modified = true
  
}

/*
 *  Méthode appelée quand on change le titre de la fiche
 *  
 */
Fiche.prototype.onchange_titre = function(evt)
{this.titre = this.input_titre.val()}

/*
 *  Méthode appelée quand on change le texte d'un paragraphe
 *  
 */
Fiche.prototype.onchange_texte = function(evt)
{
  this.texte = this.input_texte.val()
}

Fiche.prototype.dispatch = function(data){
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
    case 'id': 
      val = parseInt(val, 10); 
      break;
    case 'type':
      // Juste pour ne pas passer par default
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

