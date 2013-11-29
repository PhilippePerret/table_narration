<?php
/*
 * Charge tous les fichiers JS ou CSS
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
	echo "\n";
  while(false != ($file = readdir($dos))){
    if($file!='.' && $file!='..'){
      if(is_dir($path.$file)){ 
        if($file == $but){continue;}
        array_push($liste_dossiers, $path.$file."/");
      }else if (substr($file, -$len_suffixe) == $suffixe ){ 
				echo "\t\t";
        if($js_or_css == 'js'){
          echo '<script type="text/javascript" charset="utf-8" src="'.$path.$file.'"></script>';
          if($file == '_extension_objet_plur.js'){
            traite_dossier($path.'_extension_objet_plur/', 'js');
          }
        } else { // css
          echo '<link rel="stylesheet" type="text/css" href="'.$path.$file.'" />';
        }
				echo "\n";
      }
    }
  }
  closedir($dos);
  foreach($liste_dossiers as $path){traite_dossier($path, $js_or_css);}
}

?>