<?php
  // Chargement des librairies CSS générales

  $libs = array('flash',/*'edit',*/ 'couleur');
	echo "\n";
  foreach($libs as $lib){
    echo "\t\t".'<link rel="stylesheet" type="text/css" href="../lib/css/'.$lib.'" />'."\n";
  }
  
  traite_dossier("./css/", 'css');
?>