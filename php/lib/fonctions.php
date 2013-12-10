<?php
/*
 * Charge tous les fichiers JS ou CSS
 *
 *  NOTES
 *  -----
 *    ::  Tous les fichiers qui sont précédés de ">" sont chargés en différé
 *    ::  Tous les fichiers d'un dossier `defer' sont chargés en différé
 *        ATTENTION : s'il y a des sous-dossiers, ils ne seront pas différés
 *
 * @param $path       {String} Chemin d'accès au dossier de départ (doit se finir par "/")
 * @param $js_or_css  {String} 'js' pour les javascripts, 'css' pour les CSS
 * @param $but        {String} Optionnel, un nom de sous-dossier à passer (p.e. 'required')
 *                    Ce dossier est appelé directement avec $path pour pouvoir être traité
 */
function traite_dossier($path, $js_or_css, $but = null){
  $dos = opendir($path);
  // Les dossiers seront toujours traités après les fichiers (car les objets 
  // sont d'abord définis dans les fichiers)
  $liste_dossiers = array();
  $suffixe = $js_or_css == "js" ? ".js" : ".css";
  $len_suffixe = strlen($suffixe);
  $chargement_differed = false ;
	echo "\n";
  while(false != ($file = readdir($dos))){
    if($file!='.' && $file!='..'){
      if(is_dir($path.$file)){
        if($file == $but){continue;}
        if($file == 'defer') $chargement_differed = true ;
        else $chargement_differed = false ;
        array_push($liste_dossiers, $path.$file."/");
      }else if (substr($file, -$len_suffixe) == $suffixe ){ 
				echo "\t\t";
        $defer = "";
        if( $chargement_differed || $file{0} == '>' )
        {
          $defer = " defer" ;          
        }
        if($js_or_css == 'js'){
          echo '<script type="text/javascript" charset="utf-8" src="'.$path.$file.'"'.$defer.'></script>';
          if($file == '_extension_objet_plur.js'){
            traite_dossier($path.'_extension_objet_plur/', 'js');
          }
        } else { // css
          echo '<link rel="stylesheet" type="text/css" href="'.$path.$file.'"'.$defer.' />';
        }
				echo "\n";
      }
    }
  }
  closedir($dos);
  foreach($liste_dossiers as $path){traite_dossier($path, $js_or_css);}
}

?>