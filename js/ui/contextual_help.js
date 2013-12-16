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
      var ispara = fi.is_paragraph
      // Construire l'aide
                      aide += this.info_current_fiche
                      aide += this['space_'+(fi.opened ? 'close':'open')]
      if(fi.parent)   aide += this.left_choose_parent
      if(fi.enfants)  aide += this.right_choose_child
                      aide += this['show_'+(fi.retourned?'recto':'verso')]
      if($(fi.div_main_prop_jid).length){
        aide += this['return_change_'+(ispara?'texte':'titre')]
      }
      else 
      {
        aide += this['return_save_'+(ispara?'texte':'titre')]
        aide += this.raccourcis_textuels
        if( ispara ) aide += this.shortcut_paragraph
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
      var p_type_id = fi.parent ? fi.parent.type_id : "-"
      var info =  fi.type+":"+fi.id
      if(fi.is_not_book)      info += CH.del + "Par:"+p_type_id
      if(fi.is_not_paragraph) info += " / Enf:"+(fi.enfants||[]).length
      return info
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
  "k_m":{get:function(){
    if(undefined == this._k_m) this._k_m = this.k_lettre('M')
    return this._k_m
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
  "k_cmd":{get:function(){
    if(undefined == this._k_cmd) this._k_cmd = image('clavier/K_Command.png')
    return this._k_cmd
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
  'left_choose_parent'  : CH.del + CH.k_left+" => Parent",
  'right_choose_child'  : CH.del + CH.k_right+" => 1er enfant",
  'space_open'          : CH.del + CH.k_space+" Ouvre ",
  'space_close'         : CH.del + CH.k_space+" Ferme ",
  'return_change_titre' : CH.del + CH.k_return+" Éditer titre",
  'return_change_texte' : CH.del + CH.k_return+" Éditer texte",
  'return_save_titre'   : CH.del + CH.k_return+" Enregistre titre",
  'return_save_texte'   : CH.del + CH.k_return+" Enregistre texte",
  'show_recto'          : CH.del + CH.k_tab+" Recto",
  'show_verso'          : CH.del + CH.k_tab+" Verso"
  
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

