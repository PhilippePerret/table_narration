<?php
// Chargement des librairies générales

  $libs = array(
    'required'  => array('jquery', 'jquery-ui'),
    'optional'  => array('time', 'ajax_php', 'String-extensions', 'mouse', 'texte', 'flash', 'L', 'couleur', 'RealValue', 'Edit', 'cookie')
      // @note :  la librairie 'ajax_send' est utile aux tests, mais elle est remplacée
      //          dans l'application par sa propre librairie.
    );
	echo "\n";
  foreach($libs as $dos => $liblist){
    foreach($liblist as $lib){
      echo "\t\t".'<script type="text/javascript" charset="utf-8" src="../lib/javascript/'."$dos/$lib".'.js"></script>'."\n";
    }
  }
  
  traite_dossier('./js/', 'js')
?>