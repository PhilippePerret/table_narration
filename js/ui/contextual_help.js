/**
  * @module ContextualHelp
  */

/**
  *  Objet ContextualHelp
  *  --------------------
  *  Gestion de l'aide contextuelle
  *  
  *  Raccourci : CH
  * @class ContextualHelp
  * @static
  *
  */
window.ContextualHelp = {
  /**
    *  Initialisation (appelée quand ready)
    *
    * PRODUIT
    * -------
    *
    * @method init
    */
  init:function()
  {

  },
  
  /*
   *  Met l'aide d'identifiant +id+ dans le footer en la renseignant
   *  avec les données +params+
   *  
   */
  write:function(id, params)
  {
    if(undefined == params) params = {}
    texte_aide = this.AIDES[id]
    if(undefined != params)
    {
      for(var attr in params)
      { 
        var reg = new RegExp("\%\{"+attr+"\}", "g")
        texte_aide = texte_aide.replace(reg, params[attr])
      }
    }
    // dlog("texte aide:" + texte_aide)
    help(texte_aide)
  },
  
  /**
    * Attend +seconds+ avant d'adapter l'interface (utile par exemple lorsqu'un
    * panneau est en train de se fermer).
    *
    * @method adapt_after
    * @param  [seconds=0.5] {Float} seconds Nombre de secondes à attendre
    *
    */
  adapt_after:function(seconds, ok)
  {
    if(undefined == ok)
    {
      if(undefined == seconds) seconds = 0.5
      this.timer_wait = setTimeout($.proxy(this.adapt_after, this, null, true), seconds * 1000)
    }
    else
    {
      clearTimeout(this.timer_wait)
      this.adapt
    }
  }
}
Object.defineProperties(ContextualHelp, {
  /*
   *  = Main =
   *  Méthode principale adaptant l'aide contextuelle en fonction
   *  du contexte. Appelée par `CHelp.adapt'
   *  
   */
  "adapt":{
    get:function(){
      // Ne rien faire si le panneau film ou le panneau dico est ouvert
      if(this.panneau_film_opened || this.panneau_dico_opened) return
      if(this.current_fiche)  this.adapt_with_fiche_active
      else                    this.adapt_with_no_fiche
    }
  },
  
  /*
   *  Adapte l'aide quand une fiche est active
   *  
   */
  "adapt_with_fiche_active":{
    get:function(){
      var fi = this.current_fiche, aide = "" ;
      var ispara  = fi.is_paragraph
      var editing = $(fi.div_main_prop_jid).length == 0
      
      // === Construire l'aide contextuelle ===
      if(App.preferences.showinfos) aide += this.info_current_fiche
      if(editing){
        aide += this['return_save_'+(ispara?'texte':'titre')]
        aide += this.raccourcis_textuels
        if( ispara )
        {
          aide += this['shortcut_paragraph']
          if(PARAGRAPHS.PTYPES[fi.ptype].return_disabled != true) aide += this['maj_return_new_item']
        } 
        if(App.Clipboard.content) aide += this['cmd_v_coller_ref']
      }
      else 
      {
        aide += this['space_'+(fi.opened ? 'close':'open')]
        if(fi.parent)   aide += this.left_choose_parent
        if(fi.enfants)  aide += this.right_choose_child
        if(fi.parent && fi.parent.enfants)
        {
          aide += this.up_choose_next + this.down_choose_prev +
                  this.cmd_up_move_up + this.cmd_down_move_down
        }
        aide += this['show_'+(fi.retourned?'recto':'verso')]
        aide += this['return_change_'+(ispara?'texte':'titre')]
        if(fi.is_book) 
        {
          aide += this.cmd_p_publish
          aide += this.cmd_l_read_book
        }
        aide += this['r_reference']
      }
        
      help( aide )
    }    
  },
  
  /*
   *  Adapte quand aucune fiche n'est active
   *  
   */
  "adapt_with_no_fiche":{
    get:function(){
      this.write('no fiche')
    }
  },
  
  /**
    * Infos sur la fiche courante, à afficher en amorce
    *
    * @property info_current_fiche
    */
  "info_current_fiche":{
    get:function(){
      var fi = this.current_fiche
      var p_type_id = fi.parent ? fi.parent.id : "-"
      var info =  fi.type+":"+fi.id
      if(fi.is_not_book) info += CH.del + "Parent:"+p_type_id
      return '<span class="info_fiche">'+info+'</span>'
    }
  },
  /*
   *  Retourne TRUE si le panneau film est ouvert
   *  
   */
  "panneau_film_opened":{
    get:function(){
      return $('panneau#films_panneau').is(':visible')
    }
  },
  /*
   *  Retourne TRUE si le panneau SCÉNODICO est ouvert
   *  
   */
  "panneau_dico_opened":{
    get:function(){
      return $('panneau#dico_panneau').is(':visible')
    }
  },
  /*
   *  Retourne la fiche courante ou null
   *  Raccourci de FICHES.current
   */
  "current_fiche":{
    get:function(){
      return FICHES.current
    }
  },
  /*
   *  Raccourcis pour obtenir le code d'une image
   *  
   */
  "k_lettre":{
    value:function(lettre){return image('clavier/K_'+lettre+'.png')}
  },
  "m_click":{get:function(){
      if(undefined == this._m_click) this._m_click = image('clavier/CLICK.png')
      return this._m_click
  }},
  "k_f":{get:function(){
    if(undefined == this._k_f) this._k_f = this.k_lettre('F')
    return this._k_f
  }},
  "k_l":{get:function(){
    if(undefined == this._k_l) this._k_l = this.k_lettre('L')
    return this._k_l
  }},
  "k_m":{get:function(){
    if(undefined == this._k_m) this._k_m = this.k_lettre('M')
    return this._k_m
  }},
  "k_p":{get:function(){
    if(undefined == this._k_p) this._k_p = this.k_lettre('P')
    return this._k_p
  }},
  "k_r":{get:function(){
    if(undefined == this._k_r) this._k_r = this.k_lettre('R')
    return this._k_r
  }},
  "k_v":{get:function(){
    if(undefined == this._k_v) this._k_v = this.k_lettre('V')
    return this._k_v
  }},
  "k_up":{get:function(){
    if(undefined == this._k_up) this._k_up = image('clavier/K_FlecheH.png')
    return this._k_up
  }},
  "k_down":{get:function(){
    if(undefined == this._k_down) this._k_down = image('clavier/K_FlecheB.png')
    return this._k_down
  }},
  "k_left":{get:function(){
    if(undefined == this._k_left) this._k_left = image('clavier/K_FlecheG.png')
    return this._k_left
  }},
  "k_right":{get:function(){
    if(undefined == this._k_right) this._k_right = image('clavier/K_FlecheD.png')
    return this._k_right
  }},
  "k_return":{get:function(){
    if(undefined == this._k_return) this._k_return = image('clavier/K_Entree.png')
    return this._k_return
  }},
  "k_tab":{get:function(){
    if(undefined == this._k_tab) this._k_tab = image('clavier/K_Tab.png')
    return this._k_tab
  }},
  "k_maj":{get:function(){
    if(undefined == this._k_maj) this._k_maj = image('clavier/K_Maj.png')
    return this._k_maj
  }},
  "k_cmd":{get:function(){
    if(undefined == this._k_cmd) this._k_cmd = image('clavier/K_Command.png')
    return this._k_cmd
  }},
  "k_ctrl":{get:function(){
    if(undefined == this._k_ctrl) this._k_ctrl = image('clavier/K_Control.png')
    return this._k_ctrl
  }},
  "k_space":{get:function(){
    if(undefined == this._k_space) this._k_space = image('clavier/K_Espace.png')
    return this._k_space
  }}
})
CH = CHelp = ContextualHelp
/* ---------------------------------------------------------------------
 *  CONSTANTES TEXTUELLES
 *
 *  NOTES
 *  -----
 *    = Implémenté ici pour :
 *        1. Pouvoir l'atteindre plus rapidement si ajout
 *        2. Pouvoir profiter des méthodes k_<chose> définies ci-dessus
 --------------------------------------------------------------------- */
CH.del = ' | '
$.extend(CH, {
  'raccourcis_textuels' : CH.del + CH.k_cmd+CH.k_f+" Insert Film"+
                          CH.del + CH.k_cmd+CH.k_m+" Insert Mot",
  'shortcut_paragraph'  : CH.del + CH.k_cmd+CH.k_return+" Nouveau paragraphe",
  'left_choose_parent'  : CH.del + CH.k_left+" Parent",
  'right_choose_child'  : CH.del + CH.k_right+" 1er enfant",
  'up_choose_next'      : CH.del + CH.k_up + " Suivant",
  'down_choose_prev'    : CH.del + CH.k_down + " Précédent",
  'cmd_up_move_up'      : CH.del + CH.k_cmd+CH.k_up+" Remonte",
  'cmd_down_move_down'  : CH.del + CH.k_cmd+CH.k_down+" Descend",
  'space_open'          : CH.del + CH.k_space+" Ouvre ",
  'space_close'         : CH.del + CH.k_space+" Ferme ",
  'return_change_titre' : CH.del + CH.k_return+" Éditer titre",
  'return_change_texte' : CH.del + CH.k_return+" Éditer texte",
  'return_save_titre'   : CH.del + CH.k_return+" Enregistre titre",
  'return_save_texte'   : CH.del + CH.k_return+" Enregistre texte",
  'show_recto'          : CH.del + CH.k_tab+" Recto",
  'show_verso'          : CH.del + CH.k_tab+" Verso",
  'cmd_p_publish'       : CH.del + CH.k_cmd+CH.k_p+" Publier"+
                          " (+ "+CH.k_ctrl+" seulement TdM)",
  'r_reference'         : CH.del + CH.k_r+" -> Référence",
  'cmd_v_coller_ref'    : CH.del + CH.k_cmd+CH.k_v+" Coller réf.",
  'maj_return_new_item' : CH.del + CH.k_maj+CH.k_return+" Nouvel item",
  'cmd_l_read_book'     : CH.del + CH.k_cmd+CH.k_l+" Lire le livre"
  
})
ContextualHelp.AIDES = {
  'fiche book': "%{info_fiche} "+ CH.left_choose_child + CH.space_open_close + '|'
                ,
  /* 
    Aide lorsqu'aucune fiche n'est sélectionnée 
  */
  'no fiche' :  CH.m_click +"sur LIVRE ou " + CH.k_up + CH.k_down +
                " pour en sélectionner un. Glisser un picto fiche (Book, Chapter, etc.)"+
                " sur la table pour en créer une nouvelle."
}

