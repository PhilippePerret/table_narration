/**
  * @module     fiche_data
  * @submodule  data
  * @main       Fiche
  */

$.extend(Fiche.prototype,{
  
  /**
    * Charge toutes les données de la fiche
    *
    * @method load
    * @async
    * @param  {String|Function} poursuivre
    *                           Méthode pour suivre. Si c'est une propriété complexe
    *                           (à appeler ensuite sans parenthèses) elle doit être donnée
    *                           en {String}, sinon, envoyer une fonction normale.
    */
  load:function(poursuivre)
  {
    if('string'==typeof poursuivre) poursuivre = {id:this.id, prop:poursuivre}
    FICHES.after_load.poursuivre = poursuivre
    FICHES.load([{id:this.id, type:this.type}])
  },
  
  /**
    * Méthode appelée quand on change une option (verso)
    * @method onchange_option
    * @param  {String}  prop   La propriété à définir
    * @param  {Any}     value La valeur à lui donner
    */
  onchange_option:function(prop, value)
  {
    if(this[prop] == value) return
    this[prop] = value
    this.modified = true
  },
  
  /*
   *  Place la fiche courante APRÈS la fiche +bfiche+ {Fiche}
   *  
   *  NOTES
   *  -----
   *    = Si la fiche n'appartient pas au parent, elle est ajoutée
   *
   */
  set_after:function(bfiche)
  {
    // Ajouter au parent si nécessaire
    if(this.parent != bfiche.parent)
    {
      if(this.parent) this.parent.remove_child( this )
      bfiche.parent.add_child( this, {after: bfiche} )
    } 
    else
    {
      // Quand la fiche est déjà dans le parent
      this.parent.move_child( this, bfiche.indice + 1)
    }
    this.modified = true 
  },
  
  /*
   *  Déplace un enfant
   * 
   *  @param  child       {Fiche} enfant à déplacer
   *  @param  new_indice  {Number} Nouvelle position (0-start)
   */
  move_child:function(child, new_indice)
  {
    var cur_indice = child.indice

    // Dans le DOM
    child.obj.insertBefore(this.enfants[new_indice].obj)
    
    // Comme on va d'abord retirer l'élément de son ancienne place puis
    // l'insérer à sa nouvelle place, si l'ancienne indice est avant, il
    // faut retirer une place au nouvel indice
    if(cur_indice < new_indice) new_indice = new_indice - 1
    this.enfants.splice(cur_indice, 1)
    this.enfants.splice(new_indice, 0, child)
    this.update_indice_enfants(from = Math.min(new_indice, cur_indice))
  },
  /*
   *  Place la fiche courante AVANT la fiche +bfiche+ {Fiche}
   *
   *  NOTES
   *  -----
   *    Cf. les notes de `set_after' ci-dessus  
   */
  set_before:function(afiche)
  {
    
    // Modifier dans le parent
    // Modifier dans le DOM (div_items du parent)
    this.modified = true 
  }
})

/*
 *  Méthodes Fiche concernant les data de la fiche
 *  
 */
Object.defineProperties(Fiche.prototype,{
  /**
    * Retourne les données à enregistrer
    *
    * @property data
    * @return   {Hash} Les données à enregistrer dans la fiche
    *
    */
  "data":{
    get:function(){
      data = {
        id:this.id, type:this.type, titre:this.titre,
        top:this.top, left:this.left, dev:(this.dev || 0)
      }
      if(this.deleted)      data.deleted = true
      if(this.not_printed)  data.not_printed = true
      if(this.parent)       data.parent = {id:this.parent.id, type:this.parent.type}
      if(this.enfants)
      {
        data.enfants = []
        for(var i in this.enfants){ 
          data.enfants.push(this.enfants[i].minidata)
        }
      }
      if(this.is_book) data.real_titre  = this.real_titre
      if(this.is_paragraph)
      {
        data.texte  = this.texte
        if(this._style) data.style = this._style.join('.')
        if(this.ptype)  data.ptype = this.ptype
      } 
      return data
    }
  },
  
  /**
    * Le type de la fiche, qui détermine s'il s'agit d'un livre, d'un chapitre
    * d'une page ou d'un paragraphe.
    *
    * Notes
    * -----
    *   * C'est une donnée sur 4 lettres ('book', 'chap', 'page' ou 'para')
    *   * Ne pas confondre cette propriété avec le `ptype` du paragraphe.
    *
    * @property {String} type
    */
  "type":{
    get:function(){ return this._type || null},
    set:function(ty){ this._type = ty }
  },
  
  /**
    * Le type humain de la fiche, par exemple "livre" pour 'book'
    * @property {String} human_type
    */
  "human_type":{
    get:function(){return FICHES.datatype[this.type].hname}
  },
  
  /**
    * Méthode pratique, pour le débuggage, retournant <type>#<id> (p.e. 'book#12') 
    * @property {String} type_id
    */
  "type_id":{
    get:function(){ return this.type + '#' + this.id}
  },

  /**
    * Type d'un enfant de la fiche courante
    * Notes
    *   * C'est un raccourci de FICHES.datatype[type].child_type
    * @property {String} child_type
    */
  "child_type":{
    get:function(){return FICHES.datatype[this.type].child_type}
  },

  /**
    * Retourne l'identifiant du livre auquel appartient (ou non) la fiche, quel
    * que soit le type de la fiche. Lorsqu'elle est un livre, elle renvoie son propre
    * identifiant.
    * @property {Number|String} book_id
    */
  "book_id":{
    get:function(){
      if(undefined == this._book_id)
      {
        this._book_id = function(m){
          if(     m.is_book)  return m.id
          else if(m.book)     return m.book.id
          else                return null
        }(this)
      }
      return this._book_id
    }
  },
  
  /**
    * Définit si la fiche ne doit pas être imprimée dans le livre
    * NOTES
    * -----
    *   * Ça peut concerner tout un livre (par exemple pour de l'aide ou des notes)
    * @property {Boolean} not_printed
    * @default {Undefined}
    */
  "not_printed":{
    get:function(){return this._not_printed == true},
    set:function(value){
      if(this._not_printed == value) return
      this._not_printed = value
    }
  },
  
  /*
   *  Retourne le {Hash} des données minimum de la fiche (id et type)
   *  
   */
  "minidata":{
    get:function(){return {id:this.id, type:this.type}}
  },

  /**
    * Met dans le App.clipboard l'instance {Ref} à la fiche courante. Cette
    * référence pourra être ensuite collée dans le texte.
    * Notes
    * -----
    *   * Propriété complexe => appeler sans parenthèses
    * @method copy_reference
    */
  "copy_reference":{
    get:function(){
      App.clipboard = get_ref(this.type+"-"+this.id)
      F.show( image('clavier/K_Command.png')+image('clavier/K_V.png')+
              " pour insérer référence.")
    }
  },
  
  /* Retourne ou définit le titre */ 
  "titre":{
    get:function(){return this._titre || null },
    set:function(titre){ this._titre = titre}
  },
  
  /**
    * Retourne la valeur principal de la fiche, i.e. son titre si ce n'est pas
    * un paragraphe et son texte si c'est un paragraphe.
    * Notes
    *   * Propriété complexe
    * @property main_value
    * @type     {String}
    */
  "main_value":{
    get:function(){return this[this.main_prop]}
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
    get:function(){ 
      if(undefined == this._left) this._left = 0
      return this._left },
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
    get:function(){ 
      if(undefined == this._top) this._top = 0
      return this._top },
    set:function(top){
      this._top = parseInt(top, 10)
      if( !this.ranged ) this.positionne
    }
  },
  
  /*
   *  Plus haut ancêtre
   *  
   */
  "ancetre":{
    get:function(){
      var a = this
      while( a.type != 'book')
      {
        a = a.parent
      }
      return a
    }
  },
  /**
    * Retourne une valeur pour le champ principal (titre ou texte)
    *
    * NOTES
    * -----
    *   * Cette méthode renvoie le texte brut si +formate+ est FALSE
    *     Dans le cas contraire, elle le met en forme.
    *   * La méthode est asynchrone lorsqu'un paragraphe vient d'être défini
    *     d'un type particulier comme 'file' et que le chargement du fichier
    *     est nécessaire.
    *
    * @method main_field_value
    *
    * @param  {Boolean} formate   
    *                   Si TRUE le texte est interprété, i.e. par exemple que
    *                   ses balises de référence ([<balise>:<valeur>]) sont mises
    *                   en forme. 
    *                   Si FALSE, le texte est renvoyé tel qu'il est enregistré.
    */
  "main_field_value":{
    value:function( formate ){
      var code = "" ;
      if(this.is_paragraph) code = this.texte || ""
      else                  code = this.titre || FICHES.datatype[this.type].defvalue
      if(formate && code != "") code = ColText.formate( code, this )
      return code
    }
  },
  
  /**
    * Actualise l'affiche de la fiche au niveau de son titre ou de son texte (quand
    * c'est un paragraphe)
    * Notes
    *   * Propriété complexe => appeler sans parenthèses
    * @method update_display
    */
  "update_display":{
    get:function(){
      this.main_field.set(this.main_field_value(this.edited == false))
    }
  }
  
  
  
})

/**
  * Dispatch les données +data+ dans la fiche.
  *
  * @method dispatch
  * @param  {Object} data Les données à dispatcher dans la fiche.
  *
  */
Fiche.prototype.dispatch = function(data){
  dlog("---> Fiche::dispatch("+JSON.stringify(data)+")", DB_FCT_ENTER)
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
      prop = '_' + prop
      break
    case 'id':
    case 'dev': // niveau de développement
      val = parseInt(val, 10); 
      break;
    case 'type':
    case 'class':
      break
    case 'titre':
    case 'real_titre':
    case 'texte':
      val = val.stripSlashes()
      if(prop != 'titre') this.loaded = true
      break;
    case 'parent':
      val = FICHES.fiche( val );
      break;
    case 'enfants':
      if(val!=null && val.length > 0){
        val = FICHES.fiche( val )
      }
      break;
    case 'style':
      if('string' == typeof val) this.style = val.split('.')
      break
    }
    // On met la donnée dans la propriété
    this[prop] = val
  }
  dlog("<- Fiche::dispatch", DB_FCT_ENTER)
}
