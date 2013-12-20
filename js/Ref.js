/**
  * @module ref.js
  * 
  */

/**
  * Class pour une référence
  *
  * @class Ref
  * @param  {String} rid Identifiant de la référence : <type>-<id> de la fiche.
  */
window.Ref = function(rid)
{
  var did = rid.split('-')
  this.type = did[0]
  this.id   = did[1]
  REFS.list[rid] = this
}
$.extend(Ref.prototype,{
  formate:function(options, skip_loading)
  {
    var fiche = null ;
    if(undefined != FICHES.list[this.id])
    {
      // La fiche est déjà chargée, on va pouvoir établir un texte complet
      dlog("La fiche est déjà chargée")
      fiche = get_fiche(this.id)
    }
    else
    {
      if(false == skip_loading)
      {
        // S'il ne faut pas sauter le chargement, on charge la fiche
        fiche = get_fiche(this.id)
        return fiche.load($.proxy(this.formate, this, options, skip_loading))
      }
    }
    // Construction du texte qui doit être retourné
    var htype = FICHES.datatype[this.type].hname.capitalize()
    if (fiche)
    {
      // Un texte complet pour une fiche chargée
      return '<ref>' + htype + " " + fiche.titre + '</ref>'
    }
    else
    {
      // Un texte basique, juste pour affichage
      return "<ref>["+htype+" "+this.id+" (non chargé)]</ref>"
    }
  }
})