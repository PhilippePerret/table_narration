<?php
  
  // Quelques vérifications de l'application
  
  // Vérifier que les dossiers Collection existe bien
  if(!file_exists("./collection"))
  {
    mkdir("./collection", 0755);
    mkdir("./collection/current", 0755);
    mkdir("./collection/test", 0755);
    mkdir("./collection/backup", 0755);
  }
?>