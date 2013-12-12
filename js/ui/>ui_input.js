/*
 *  Sous-Objet UI.Input
 *  -------------------
 *  Gestionnaire de champ de saisie.
 *  Malgré son nom, gère aussi bien les input de type "text" que les textarea.
 *
 *
 */
UI.Input = {
  
  /*
   *  La cible courante
   *  -----------------
   *
   *  C'est un {Object} tel que défini par la méthode `eventTextField' ci-dessous,
   *  qui contient notamment les propriétés 'dom' ({DOMElement}), `jq' ({jQuerySet})
   *  `id', `jid', `value' ou encore `tag'.
   *
   */
  target: null, 
  
  /*
   *  Méthode appelée pour placer les observers sur les champs fournis
   *  en argument.
   *
   *  @param  field     Le champs {DOM Element} ou {Set jQuery} qui doit être
   *                    géré par UI.Input
   *                    OU le container dans lequel on va fouiller.
   *
   */
  bind:function(field)
  {
    var real_field = this.real_field_from( field )
    this.bind_or_unbind( real_field, bind = true)
    return real_field
  },
  
  /*
   *  Détache le gestionnaire d'évènement du champ
   *  
   *  @param  field     Le champs {DOM Element} ou {Set jQuery} qui doit être
   *                    géré par UI.Input
   */
  unbind:function(field)
  {
    this.bind_or_unbind( this.real_field_from( field ), bind = false)
  },
  
  /*
   *  Attache ou détache le gestionnaire d'évènement 'focus', 'blur'
   *  aux champs de saisie de texte +field+
   *  
   */
  bind_or_unbind:function(fields, binding)
  {
    fields[binding?'bind':'unbind']('focus', $.proxy(this.onfocus, this))
    fields[binding?'bind':'unbind']('blur',  $.proxy(this.onblur,  this))
    fields[binding?'bind':'unbind']('click dblclick', $.proxy(this.unpropage, this))
  },
  
  /*
   *  Méthode appelée quand on focusse dans le champ
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
  
  /*
   *  Méthode appelée quand on blur du champ
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
          dlog("Méthode `onchange_"+this.target.property+"' appelée sur "+fiche.type_id)
          fiche['onchange_'+this.target.property](new_value)
        }
      }
    }
    
    this.set_keypress(focus = false)
    return this.unpropage(evt)
  },
  
  /*
   *  Méthode appelée quand on presse une touche sur le champ courant
   *  
   *  @param  evt   {Keypress Event}
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
       */
      // Quelque soit le champ, on doit blurer
      this.target.jq.blur()
      // Traitement spécial pour un champ texte de fiche paragraphe
      if(this.target.hasFiche && this.target.property == 'texte')
      {
        // => Champ de saisie du texte d'un paragraphe
        dlog("C'est un champ texte de paragraphe")
        
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
        else
        {
          // => Un message d'aide
          F.show("Tip: Pour créer un nouveau paragraphe à la suite d'un paragraphe édité, utiliser CMD + ENTER.")
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
          FILMS.choose_a_film($.proxy(FILMS.insert_in_input, FILMS))
          return stop_event(evt)
        case Key_m: //=> Insérer un mot du scénodico
          console.log("---> Insertion d'un mot du scénodico")
          return stop_event(evt)
        case Key_r: //=> Insérer une référence vers une fiche
          console.log("---> Insertion d'une référence vers une fiche")
          return stop_event(evt)
        case Key_u:
          if(kmeta) this.set_selection_to('<u>_$_</u>')
          return stop_event(evt) // toujours
        }
      }
    }
    // Si on arrive ici, on bloque la propagation de l'évènement
    return this.unpropage(evt)
  },
  
  /*
   *  Traite la donnée du champ courant en fonction de son data-type
   *
   *  NOTES
   *  -----
   *    • La méthode est appelée dans le onblur, pour le moment
   *      + quand on tab sur le champ
   *
   *    • Aucun traitement si le champ est vide
   *  
   *  @return TRUE si tout est OK ou false dans le cas contraire
   */
  check_value:function()
  {
    // Valeur dans le champ
    var value       = this.target.jq.val().trim()
    if(value == "") return true
    // Format attendu (if any)
    // @note: Mis dans une variable car pourra être mis à null pour
    //        empêcher le check du format général, lorsque la data est particulière.
    var data_format = this.target.format

    switch(this.target.data_type)
    {
    case 'number':
      // La donnée doit être un nombre
      if( isNaN(value)) return F.error("La donnée devrait être un nombre")
      break
    case 'horloge':
      // La donnée doit être transformée en horloge
      // TODO
      break
    case 'people':
      switch(this.target.format)
      {
        case 'auteur':
          expected = 'Prénom, Nom, Objet (scénario|roman|etc.)'
          break
        case 'acteur':
          expected = "Prénom, Nom, Prénom/surnom personnage, Nom personnage, Fonction personnage"
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

    // Si un format précis est attendu
    if(data_format)
    {
      var regexp = new RegExp(data_format)
      if(value.replace(regexp, '') != "") return F.error("La donnée “"+value+"” n'est pas au bon format (requis : "+data_format+")")
    }
    
    Flash.clean()
    return true 
  },
  /*
   *  Remplace la sélection de la cible courante
   *  
   *  @param  valeur    Le texte (utiliser `_$_' pour faire référence au texte sélectionné)
   *  @param  options   Optionnel, un {Hash} pour Selection.set
   *                    Par défaut, c'est `{end:true}' qui placera le curseur après
   *                    le texte remplacé.
   */
  set_selection_to:function(valeur, options)
  {
    Selection.set(this.target.dom, valeur, options || {end:true})  
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
  
  /*
   *  Définit le keypress à utiliser sur l'élément
   *  
   *  @requis this.target, définissant la cible courante
   *  @param  focusing    TRUE si on focus sur le champ, FALSE otherwise
   */
  set_keypress:function(focusing)
  {
    if(focusing)
    {
      // Pour le moment, le même, mais pourra changer suivant le contexte
      this.target.binding = $.proxy(this.onkeypress, this) // pour le unbind ci-dessous
      this.target.jq.bind('keypress', this.target.binding)
    }
    else
    {
      this.target.jq.unbind('keypress', this.target.binding)
    }
  },
  
  /*
   *  Return le vrai jQuery Set de champ de text de +obj+
   *  
   *  @param  obj   Soit un champ de saisie de text ({Dom Element} ou {jQuery Set})
   *                Soit un container ({DOMElement} ou {jQuerySet}) contenant des
   *                champs de saisie de texte.
   *
   *  @return Un {jQuerySet} du ou des champs de texte.
   *
   */
  real_field_from:function(obj)
  {
    if(UI.is_text_field(obj)) return $(obj)
    else return $(obj).find('textarea, input')
  },
  
  /*
   *  Retourne l'élément DOM ciblé par l'évènement +evt+
   *  
   *  
   *  @param  evt   Event quelconque.
   *
   *  @return un {Hash} contenant :
   *
   *    dom     DOMElement de l'élément
   *    jq      jQuery Set de l'élément
   *    id      Identifiant du champ
   *    jid     jQuery Selector du champ
   *    tag     Le tagname de l'élément
   *    type    Le type de l'élément
   *    value   La valeur de l'élément (if any)
   *
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
  
  /*
   *  Gestion des erreurs
   *  
   */
  ERRORS:{
    'target doesnt match':"### ERREUR : Les champs ne correspondant pas (UI.Input.current et celui de l'évènement)"
  },
  /*
   *  Provoque l'erreur
   *  
   *  NOTE: On peut ajouter autant d'arguments que l'on veut, ils seront
   *        envoyés en console.
   */
  error:function(err_id)
  {
    for(var i=1, len=arguments.length; i<len; ++i) dlog(arguments[i])
    throw this.ERRORS[err_id]
  },
  
  /*
   *  Empêche l'Event +evt+ de se propager et renvoie true.
   *
   *  @usage :  Simplement à la fin d'une méthode gérant un type d'évènement
   *            avec `return this.unpropage(<evt>)'
   *  
   */
  unpropage:function(evt)
  {
    evt.stopPropagation()
    return true
  }
  
}