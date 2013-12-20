/**
 * @module    UI
 * @submodule Input
 *
 **/

/**
  *  Sous-Objet UI.Input
  *
  *  Gestionnaire de champ de saisie.
  *  Malgré son nom, gère aussi bien les input de type "text" que les textarea.
  *
  *  @class  UI.Input
  *  @static
  *
  **/
UI.Input = {
  
  /**
    *  La cible courante
    *
    *  C'est un {Object} tel que défini par la méthode `eventTextField' ci-dessous,
    *  qui contient notamment les propriétés 'dom' ({HTMLDom}), `jq' ({jQuerySet})
    *  `id', `jid', `value' ou encore `tag'.
    *
    *  @property target {Object}
    *  @default  null
    *
    */
  target: null, 
  
  /**
    *  Les champs de saisie mémorisés par la méthode `memorize_current'
    *
    *  En clé, un timestamp permettant de récupérer le champ de saisie et
    *  de le remettre dans le même état (sélection)
    *  En valeur, une {Target} telle que définie par la méthode
    *  this.eventTextField
    * 
    *  @property targets
    *  @type     {Hash}
    *  @default  null 
    */
  targets:null,
  
  /**
    *  Méthode appelée pour placer les observers sur les champs fournis
    *  en argument.
    *
    *  @method bind
    *  @param  field     {DOM Element|Set jQuery} Le champs qui doit être
    *                    géré par UI.Input ou son container.
    *  @return {jQuerySet} Le set jQuery bindé.
    */
  bind:function(field)
  {
    var real_field = this.real_field_from( field )
    this.bind_or_unbind( real_field, bind = true)
    return real_field
  },
  
  /**
    *  Détache le gestionnaire d'évènement du champ
    *
    *  @method unbind  
    *  @param  field     {HTMLDom|Set jQuery} Le champs qui doit être
    *                    géré par UI.Input
    *
    */
  unbind:function(field)
  {
    this.bind_or_unbind( this.real_field_from( field ), bind = false)
  },
  
  /**
    *  Attache ou détache le gestionnaire d'évènement 'focus', 'blur'
    *  aux champs de saisie de texte +field+
    * 
    *  @method bind_or_unbind
    *  @param  fields  {jQuerySet} Set jquery des éléments à binder ou unbinder.
    *  @param  binding {Boolean} Si TRUE, bind le set jquery, sinon le unbind.
    *
    */
  bind_or_unbind:function(fields, binding)
  {
    fields[binding?'bind':'unbind']('focus', $.proxy(this.onfocus, this))
    fields[binding?'bind':'unbind']('blur',  $.proxy(this.onblur,  this))
    fields[binding?'bind':'unbind']('click dblclick', $.proxy(this.unpropage, this))
  },
  
  /**
    *  Méthode appelée quand on focusse dans le champ
    *  
    *  @method onfocus
    *  @param  evt   {Event} L'évènement `focus' déclenché sur le set courant.
    *
    */
  onfocus:function(evt)
  {
    var target = this.eventTextField(evt) 
        // => {Object} complexe (cf. eventTextFieldci-dessous)
    dlog("-> UI.Input.onfocus (dans " + target.tag + '#' + target.id +")", DB_FCT_ENTER)
    this.target = target
    this.target.jq.select()
    this.set_keypress(focus = true)
    return this.unpropage(evt)
  },
  
  /**
    *  Méthode appelée quand on blur du champ
    * 
    *  @method onblur
    *  @param  evt   {BlurEvent} L'évènement `blur' déclenché sur le set courant.
    *
    */
  onblur:function(evt)
  {
    var target = this.eventTextField(evt)
        // => {Object} complexe (cf. eventTextFieldci-dessous)
    if(target.jid != this.target.jid) this.error('target doesnt match', evt, target)
    dlog("-> UI.Input.onblur (dans " + target.tag + '#' + target.id +")", DB_FCT_ENTER)
    
    // Traitement spéciaux (par exemple champs d'édition de type "people")
    // Si la touche TAB a été utilisée, le traitement a eu lieu avant et on
    // reste dans le champ
    if(target.data_type && this.check_value() == false){
      this.target.jq.select()
      return stop_event(evt)
    } 
    
    // Traitements spéciaux dans le cas d'une fiche
    if(this.target.hasFiche)
    {
      var fiche     = get_fiche(this.target.fiche_id)
      var new_value = this.target.jq.val()
      if(fiche.main_prop == this.target.property )
      {
        fiche.onchange_titre_or_texte( new_value )
        fiche.disable_main_field
      }
      else
      {
        if('function' == typeof fiche['onchange_'+this.target.property])
        {
          fiche['onchange_'+this.target.property](new_value)
        }
      }
    }
    
    this.set_keypress(focus = false)
    return this.unpropage(evt)
  },
  
  /**
    *  Méthode appelée quand on presse une touche sur le champ courant. Gère
    *  l'utilisation de touches ou combinaisons de touches spéciales, comme 
    *  CMD+F pour insérer une balise film ou CMD+M pour insérer un mot du scénodico.
    * 
    *  @method onkeypress 
    *  @param  evt   {Event} Évènement `keypress' déclenché sur l'input courant.
    */
  onkeypress:function(evt)
  {
    this.infos_keypress('onkeypress', evt) // seulement si DB_INFOS_EVENT
    
    /* Test du KEYCODE */
    switch(evt.keyCode)
    {
    case K_RETURN:
      /*
       *  La touche retour produit des choses différentes en fonction
       *  du contexte.
       *  Pour un INPUT-text, on blure simplement le champ (ce qui 
       *  entraînera la correction/validation du texte entré)
       *  Pour un TEXTAREA, le comportement est différent suivant qu'on se
       *  trouve dans un champ quelconque ou dans le texte d'un paragraphe.
       *  Pour un paragraphe, cela provoque la création d'un nouveau
       *  paragraphe juste au-dessous du champ courant, et ce nouveau
       *  champ prend la place du champ courant
       *
       *  NOTES
       *  -----
       *    = Pour qu'un champ textarea se comporte normalement, lui ajouter
       *      la classe css "returnable"
       *  
       */
      // Un champ "returnable" se comporte normalement
      if(this.target.jq.hasClass('returnable')) return true
      // Quelque soit le champ, on doit blurer
      this.target.jq.blur()
      // Traitement spécial pour un champ texte de fiche paragraphe
      if(this.target.hasFiche && this.target.property == 'texte')
      {
        var fiche = get_fiche( this.target.fiche_id )
        if(evt.metaKey)
        {
          // CMD + ENTER => Création d'un nouveau paragraphe
          var data = {type:'para'}
          // Si le style du paragraphe courant définit un style after,
          // on l'utilise.
          if(fiche.next_style) data.style = [fiche.next_style]
          var ipara = FICHES.full_create( data )
          // On l'ajoute au parent en dessous du paragraphe courant
          fiche.parent.add_child( ipara, {after:fiche} )
          // Et on le met en édition
          ipara.select
          ipara.enable_main_field
        }
      }
      return stop_event(evt)
    case K_TAB:
      var targ  = this.target ;
      var fiche = FICHES.list[targ.fiche_id] ; // défini seulement pour les fiches
      if(this.check_value() == false /* bad data */)
      { 
        this.target.jq.select()
        return stop_event(evt)
      }
      /*
       *  Si c'est le champ principal d'une fiche (titre/texte), alors
       *  on doit stopper complètement l'évènement est remettre le
       *  DIV.
       *  
       */
      if(fiche && targ.property == fiche.main_prop)
      {
        fiche.disable_main_field
        return stop_event(evt)
      }
      break; // on passe au champ suivant
    default:
      var kmeta = evt.metaKey, kctrl = evt.ctrlKey, kmaj = evt.shiftKey ;
      if(kctrl || kmeta)
      {
        /* Test du CHARCODE (seulement si CTRL ou CMD pressés)*/
        this.infos_keypress('onkeypress', evt)
        switch(evt.charCode)
        {
        case Key_b:
          if(kmeta) this.set_selection_to('<strong>_$_</strong>')
          return stop_event(evt) // toujours
        case Key_d:
          if(kmeta) this.set_selection_to(kmaj ? '<ins>_$_</ins>' : '<del>_$_</del>')
          return stop_event(evt) // toujours
        case Key_i:
          if(kmeta) this.set_selection_to('<i>_$_</i>')
          return stop_event(evt) // toujours
        case Key_f: //=> Insérer un film
          FILMS.choose_an_item($.proxy(FILMS.insert_in_input, FILMS))
          return stop_event(evt)
        case Key_m: //=> Insérer un mot du scénodico
          DICO.choose_an_item($.proxy(DICO.insert_in_input, DICO))
          return stop_event(evt)
        case Key_u:
          if(kmeta) this.set_selection_to('<u>_$_</u>')
          return stop_event(evt) // toujours
        case Key_v:
          /*
           * Fonctionnement spécial de la combinaison CMD+V. Elle peut se comporter
           * normalement (coller le contenu du clipboard), mais si le clipboard de
           * l'application (App.clipboard) contient une valeur (comme par exemple une
           * référence) alors c'est ce contenu qui est copié (et effacé).
           */
          if(kmeta)
          {
            dlog("cmd-v")
            if(App.coller_clipboard) return stop_event(evt)
            else return true
          }
          break
        }
      }
    }
    // Si on arrive ici, on bloque la propagation de l'évènement
    this.unpropage(evt)
    /*
     *  Si aucune touche n'a été traitée, on regarde du côté des méthodes par défaut
     *  
     */
    return window.keypress_default(evt)
  },
  
  /**
    *  Traite la donnée du champ courant en fonction de son data-type, peut la modifier
    *  à la volée ou interrompre la suite dans le cas d'une donnée incorrecte.
    *
    *
    *  NOTES
    *  -----
    *    * La méthode est appelée dans le onblur, pour le moment
    *      + quand on tab sur le champ
    *    * Aucun traitement si le champ est vide
    *    * Si une valeur est modifiée, il faut la remettre dans
    *      le champ à l'aide de `this.target.jq.val(nouvelle valeur)'
    *  
    *  @method check_value
    *  @return TRUE si tout est OK ou false dans le cas contraire, ce qui interrompt
    *          la procédure en cours.
    */
  check_value:function()
  {
    // Valeur dans le champ
    var value       = this.target.jq.val().trim()
    var data_type   = this.target.data_type || ""
    var data_types  = data_type.split(' ')
    if(value == "" && data_types.indexOf('not_empty') < 0) return true
    // Format attendu (if any)
    // @note: Mis dans une variable car pourra être mis à null pour
    //        empêcher le check du format général, lorsque la data est particulière.
    var data_format = this.target.format
    for(var itype=0, len=data_types.length; itype<len; ++itype)
    {
      var data_type = data_types[itype]
      switch(data_type)
      {
        // TODO Plus tard, ça devra être un data_format
      case UI.FIELD_NOT_EMPTY:
        if(value == "") return F.error("Cette donnée est absolument requise.")
        break
      case UI.FIELD_NUMBER:
        // La donnée doit être un nombre
        if( isNaN(value)) return F.error("La donnée devrait être un nombre")
        break
      case UI.FIELD_HORLOGE:
        value = value.trim().replace(/,/g, ':').replace(/ /g, '')
        this.target.jq.val(Time.m2h(Time.h2m(value)))
        break
      case UI.FIELD_PEOPLE:
        switch(this.target.format)
        {
          case 'auteur':
            expected = 'Prénom, Nom, Objet (scénario|roman|etc.)'
            break
          case 'acteur':
            expected = "Prénom, Nom, Prénom/surnom personnage, Nom personnage, Fonction personnage"
            init_value = "" + value
            value = this.traite_as_acteurs_from_imdb( value )
            if (init_value != value) this.target.jq.val(value)
            break
          default:
            expected = "Prénom, Nom"          
        }
        var lines = value.trim().split("\n"), line, iline = 0;
        var newlines = []
        var nombre_elements_expected = expected.split(',').length
        for(len=lines.length; iline < len; ++iline )
        {
          line = lines[iline]
          if(line.split(',').length != nombre_elements_expected){
            // On essaie de corriger, si les espaces remplacent les virgules
            if(line.split(' ').length == nombre_elements_expected)
            { // => Correction de la donnée
              line = line.split(' ').join(', ')
            }
            else
            { // => Erreur
              return F.error("La donnée “"+line+"” n'est pas au bon format (requis : "+expected+")")
            }
          }
          newlines.push( line )
        }
        newlines = newlines.join("\n")
        if(newlines != value) this.target.jq.val(newlines)
        data_format = null // pour ne pas passer ci-dessous
      }
    }

    // Si un format précis est attendu
    if(data_format)
    {
      var regexp = new RegExp(data_format)
      if(value.replace(regexp, '') != "") return F.error("La donnée “"+value+"” n'est pas au bon format (requis : "+data_format+")")
    }
    
    Flash.clean()
    return true 
  },
  
  /**
    * Traite la donnée +acteurs+ avant sa vérification par la méthode {check_values}
    * dans le cas d'un copié/collé d'une donnée prise dans IMDb.
    * 
    * NOTES
    * -----
    *   * On reconnait une donnée IMDb pour un acteur car elle sépare le patronyme
    *     de l'acteur du patronyme du personnage par un "...\n". Noter que le 
    *     patronyme de l'acteur est répété au début, donc la donnée a le format :
    *         <patronyme acteur> <patronyme acteur> ...
    *         <patronyme personnage>
    *
    *     Elle sera transformée en :
    *         <prenom acteur>, <nom acteur>, <prenom perso>, <nom perso>, null
    *
    *     note: Le `null` ci-dessus concerne la fonction du personnage dans le film.
    *
    * @method traite_as_acteurs_from_imdb
    *
    * @param  value {String} La valeur complète contenu dans le champ acteurs.
    * @return {String} La valeur corrigée, si nécessaire.
    */
  traite_as_acteurs_from_imdb:function(value)
  {
    if(value.indexOf('...') < 0) return value
    value = value.replace(/( |\t)+/g, ' ')
    value = L(value.split("\n")).collect(function(line){
      return line.trim()
    }).join("\n").replace(/ ?\.\.\. ?\n/g, " ")
    return L(value.split("\n")).collect(function(line){
      dline = line.split(" ")
      // On retire le doublement du patronyme (if any)
      if(dline[0] == dline[2] && dline[1] == dline[3]) dline.splice(0,2)
      dline.push('null')
      return dline.join(', ')
    }).join("\n")
  },
  
  /**
    * Remplace la sélection de la cible courante
    * 
    * @method set_selection_to
    * @param  {String} valeur    Le texte (utiliser `_$_' pour faire référence au texte sélectionné)
    * @param  {Object} options   Optionnel, un {Hash} pour Selection.set
    *                   Par défaut, c'est `{end:true}' qui placera le curseur après
    *                   le texte remplacé.
    */
  set_selection_to:function(valeur, options)
  {
    Selection.set(this.target.dom, valeur, options || {end:true})  
  },
  
  /**
    * Mémorise le champ courant, s'il est défini, et notamment sa sélection courante,
    * pour pouvoir retrouver le même état. Utilisé lorsque l'on doit par exemple
    * “blurer” un champ de saisie pour choisir un film ou un mot, pour l'insérer
    * ensuite dans ce champ.
    *
    * Notes
    * -----
    *   * La méthode peut être appelée sans qu'il y ait de champ courant.
    *     Par exemple, quand on affiche l'aperçu d'un mot (en passant sa souris
    *     sur son nom) et qu'on clique sur la définition pour mettre le mot
    *     en édition.
    *   * C'est ensuite la méthode `retreive_current` qui remet le champ mémorisé
    *     dans son état précédent.
    *
    * @method memorize_current
    * @param  {Object} options  Liste des options à prendre en compte. Pour le moment,
    *                           ces options se résument à `blur` qui, si true, blur
    *                           le champ courant.
    * @return {Number} id Identifiant (dans `targets`) du champ mémorisé.
    *
    */
  memorize_current:function(options)
  {
    if(undefined == options) options = {}
    if(!this.target) return null // pas d'édition courante
    var id = Time.now()
    if(!this.targets) this.targets = {}
    // On prend la sélection courante
    this.target.selection = Selection.of(this.target.dom)
    
    this.targets[id] = $.extend({}, this.target)
    if(options.blur)
    {
      this.target.dom.blur()
      if(this.target.hasFiche)
      {
        var fiche = get_fiche(this.target.fiche_id)
        if(fiche.main_prop == this.target.property ) fiche.disable_main_field
      }
    }
    return id
  },
  
  /**
    * Réactive le champ d'édition mémorisé par `memorize_current` en le remettant
    * dans le même état de sélection.
    *
    * Notes
    * -----
    *   * Resélectionne ce qui était sélectionné dans le champ, très exactement.
    *
    * @method retreive_current
    * @param  {Number} id Identifiant dans `targets` du champ à réactiver.
    * @param  {Object} options  Les options à prendre en compte. Pour le moment, 
    *                           seule le propriété `focus` est utilisée. Si sa valeur
    *                           est True, on focusse dans le champ.
    */
  retreive_current:function(id, options)
  {
    if(undefined == options) options = {}
    this.target = this.targets[id]
    // Il faut reprendre la sélection dans this.target maintenant, car
    // this.target sera modifié ci-dessous quand on ré-activera
    // le champ the this.targets[id]
    var selection = $.extend({}, this.target.selection)
    if(!this.target) throw "La target d'identifiant "+id+" n'est pas définie…"
    if(options.focus)
    {
      if(this.target.hasFiche)
      {
        var fiche = get_fiche(this.target.fiche_id)
        if(fiche.main_prop == this.target.property )
        {
          fiche.enable_main_field
        }
      }
      // On remet la sélection précédente
      Selection.select(this.target.dom, selection)
    }
  },
  
  /*
   *  Débug les infos sur l'évènement 'keypress'
   *  (si DL contient DB_INFOS_EVENT)
   *  
   */
  infos_keypress:function(method, evt)
  {
    dlog("-> UI.Input."+method+" "+
            "[charCode:"+evt.charCode+", keyCode:"+evt.keyCode+", "+
            "shift:"+evt.shiftKey+", ctrl:"+evt.ctrlKey+", cmd:"+evt.metaKey+"]", DB_INFOS_EVENT)
  },
  
  /**
    * Bind ou Unbind le 'keypress' sur la `target` courante, en fonction de la valeur
    * de +focusing+
    * 
    * Requis
    * ------
    *   * {Object} this.target, définissant le champ courant (donnée complexe)
    *
    * @method set_keypress
    * @param  {Boolean} focusing    TRUE si on focus sur le champ, FALSE otherwise
    *
    */
  set_keypress:function(focusing)
  {
    this.target.binding = $.proxy(this.onkeypress, this) // pour le unbind ci-dessous
    if(focusing)
    {
      // Pour le moment, le même, mais pourra changer suivant le contexte
      this.target.jq.bind('keypress', this.target.binding)
    }
    else
    {
      this.target.jq.unbind('keypress', this.target.binding)
    }
  },
  
  /**
    * Return le vrai jQuery Set de champ de text de +obj+
    * 
    * @param  obj   {HTMLDom} ou {jQuerySet} Soit un champ de saisie de text
    *               Soit un container ({HTMLDom} ou {jQuerySet}) contenant des
    *               champs de saisie de texte.
    *
    * @method real_field_from
    * @param  {HTMLDom|jQuerySet} obj Retourne le "vrai" champ de texte, même lorsque
    *                             c'est son container (parent) qui est tranmis.
    * @return {jQuerySet} Le set jQuery du ou des champs de texte.
    *
    */
  real_field_from:function(obj)
  {
    if(UI.is_text_field(obj)) return $(obj)
    else return $(obj).find('textarea, input')
  },
  
  /**
    * Retourne l'élément DOM ciblé par l'évènement +evt+
    * 
    * @method eventTextField
    * @param  {Event} evt   Event quelconque.
    *
    * @return {Object} un {Hash} définissant :
    *   * dom         {HTMLDom}   DOMElement de l'élément
    *   * jq          {jQuerySet} jQuery Set de l'élément
    *   * id          {Number}    Identifiant du champ
    *   * jid         {Selector}  Sélecteur jQuery du champ
    *   * tag         {String}    Le tagname de l'élément
    *   * type        {String}    Le type de l'élément ("text", "button", etc.)
    *   * value       {String|Null} La valeur de l'élément (if any)
    *   * selection   {Object}    La sélection courante ({start, end, content})
    *   * data_type   {String}    Le “data-type” du champ de saisie, qui permet de
    *                             traiter et surveiller sa valeur.
    *   * format      {String}    Le “format” de la donnée, si spécial (travaille souvent
    *                             en conjugaison avec le `data_type`)
    *   * is_input    {Boolean}   True si le champ est un input-text
    *   * is_textarea {Boolean}   True si le champ est un textarea
    *   * hasFiche    {Boolean}   True si le champ appartient à une fiche
    *   * fiche_id    {String|Null} L'identifiant de la fiche, if any
    *   * property    {String|Null} La propriété de la fiche que ce champ met en édition
    */
  eventTextField:function(evt)
  {
    var target = $(evt.currentTarget)
    var domObj = target[0]
    var data = {
             jq : target,
            obj : target, // parce que j'utilise souvent 'obj' par réflexe
            dom : domObj,
             id : domObj.id,
            jid : domObj.tagName+'#'+domObj.id,
            tag : domObj.tagName,
           type : target.attr('type'),
          value : domObj.value,
      selection : Selection.of(domObj),
      data_type : target.attr('data-type'),
         format : target.attr('data-format'),
       is_input : null,
    is_textarea : null,
       /* Seulement si c'est le champ d'une fiche */
       hasFiche : null,
       property : null,
       fiche_id : null
    }
    data.is_input     = data.tag == 'INPUT'
    data.is_textarea  = !data.is_input
    
    /* On regarde si c'est une fiche */
    var dId = domObj.id.split('-')
    if(dId[0] == 'f')
    {
      data.hasFiche = true
      data.fiche_id = dId[1]
      data.property = dId[2]
    }
        
    return data
  },
  
  /**
    * Constantes erreurs pour l'objet UI.Input
    * @property ERRORS
    * @static
    */
  ERRORS:{
    'target doesnt match':"### ERREUR : Les champs ne correspondant pas (UI.Input.current et celui de l'évènement)"
  },
  /**
    * Provoque l'erreur d'identifiant +err_id+ dans `ERRORS`
    * 
    * Notes
    * -----
    *   * C'est une erreur fatale (throw)
    *   * On peut ajouter autant d'arguments que l'on veut, ils seront
    *     envoyés en console.
    *
    * @method error
    * @param  {String} err_id   Identifiant de l'erreur dans `ERRORS`
    *
    */
  error:function(err_id)
  {
    for(var i=1, len=arguments.length; i<len; ++i) dlog(arguments[i])
    throw this.ERRORS[err_id]
  },
  
  /**
    *  Empêche l'Event +evt+ de se propager mais renvoie true.
    *
    *  @usage :  Simplement à la fin d'une méthode gérant un type d'évènement
    *            avec `return this.unpropage(<evt>)'
    * @method unpropage
    * @param  {Event} evt   L'évènement à traiter
    * @return {Boolean} true
    *
    */
  unpropage:function(evt)
  {
    evt.stopPropagation()
    return true
  }
  
}