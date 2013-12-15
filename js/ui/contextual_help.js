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
  /*
   *  Initialisation (appelée quand ready)
   *  
   */
  init:function()
  {

  },
  img_click : function(){return image('clavier/CLICK.png')},
  
  /*
   *  Met l'aide d'identifiant +id+ dans le footer en la renseignant
   *  avec les données +params+
   *  
   */
  write:function(id, params)
  {
    if(undefined == params) params = {}
    texte_aide = this.AIDES[id]
    
    help(texte_aide)
  },
  
  
}
Object.defineProperties(ContextualHelp, {
  /*
   *  Raccourcis pour obtenir le code d'une image
   *  
   */
  "img_click":{
    get:function(){
      if(undefined == this._img_click)
      {
        this._img_click = image('clavier/CLICK.png')
      }
      return this._img_click
    }
  },
  "img_up":{get:function(){
    if(undefined == this._img_up) this._img_up = image('clavier/K_FlecheH.png')
    return this._img_up
  }},
  "img_down":{get:function(){
    if(undefined == this._img_down) this._img_down = image('clavier/K_FlecheB.png')
    return this._img_down
  }},
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
      var fiche = this.current_fiche
      
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
  }
})
CH = CHelp = ContextualHelp
/* ---------------------------------------------------------------------
 *  CONSTANTES TEXTUELLES
 *
 *  NOTES
 *  -----
 *    = Implémenté ici pour :
 *        1. Pouvoir l'atteindre plus rapidement si ajout
 *        2. Pouvoir profiter des méthodes img_<chose> définies ci-dessus
 --------------------------------------------------------------------- */
ContextualHelp.AIDES = {
  /* 
    Aide lorsqu'aucune fiche n'est sélectionnée 
  */
  'no fiche' :  CH.img_click +"sur LIVRE ou " + CH.img_up + CH.img_down +
                " pour en sélectionner un. Glisser un picto fiche (Book, Chapter, etc.)"+
                " sur la table pour en créer une nouvelle."
}

