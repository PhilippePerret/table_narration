<?php
function traite_dossier($path, $js_or_css){
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
        if($file == '_extension_objet_plur'){continue;}
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