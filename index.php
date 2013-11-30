<?php
if($_POST['data'])
{
  // Requête ajax
  include "./php/lib/ajax.php";
}
else
{
  // Chargement normal de la table Narration
  include "./php/lib/fonctions.php";
  include "./php/view/gabarit.php";
}

?>