<?php
// Chargement des librairies générales

  $libs = array(
    'required'  => array('jquery', 'jquery-ui'),
    'optional'  => array('time', 'ajax_php', 'String-extensions', 'mouse', 'selection', 'texte', 'flash', 'L', 'couleur', 'RealValue', 'Edit', 'cookie', 'ui_basic', 'utils')
      // @note :  la librairie 'ajax_send' est utile aux tests, mais elle est remplacée
      //          dans l'application par sa propre librairie.
    );
	echo "\n";
  foreach($libs as $dos => $liblist){
    foreach($liblist as $lib){
      echo "\t\t".'<script type="text/javascript" charset="utf-8" src="../lib/javascript/'."$dos/$lib".'.js"></script>'."\n";
    }
  }
  
  traite_dossier('./js/required/', 'js');
  traite_dossier('./js/', 'js', 'required');
  
  // Données pour les films (du dossier `interdata')
  echo "\t\t".'<script type="text/javascript" charset="utf-8" src="../interdata/film/data_js/films_data.js" defer></script>';
?>