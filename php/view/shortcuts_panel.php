<?php
// === Panneau contenant les raccourcis-clavier ===

$tbl_shortcuts = array(
  'K_F'       => "Fermer la fiche sélectionnée",
  'K_O'       => "Ouvrir la fiche sélectionnée",
  'K_Espace'  => "Toggle (ouvrir/fermer) la fiche sélectionnée",
  'K_Entree'  => "En édition, enregistre le changement.",
  "K_D"       => "Hors champ d'édition, déselectionne la fiche sélectionnée",
  'K_Command+K_Entree'  => "Dans un paragraphe en édition, crée un nouveau paragraphe"
) ;
  
  foreach($tbl_shortcuts as $k => $texte)
  {
    $shortcut = "" ;
    $dkeys = explode('+', $k) ;
    foreach($dkeys as $key)
    {
      $shortcut .= '<img src="../lib/img/clavier/'.$key.'.png" /> ' ;
    }
    $code .= "<tr><td class=\"shortcut\">".$shortcut."</td><td class=\"description\">".$texte."</td></tr>";
  }
?>
<table id="shortcuts_panel" style="display:none;">
  <colgroup>
    <col width="200">
    <col width="500">
  </colgroup>
  <?php echo $code; ?>
</table>