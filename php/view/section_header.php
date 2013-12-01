<section id="header">
  <?php
  $mode_normal = file_exists('./.mode_test') == false
  ?>
  <?php
    // --- BOUTONS À DROITE ---
    // 
    // Note:  Les plus en haut seront les plus à gauche
  ?>
  <div id="buttons_right">
    <!-- Bouton pour forcer un backup -->
    <input
      id="btn_force_backup"
      type="button"
      value="Force Backup"
      onclick="Collection.force_backup"
      />
    <!-- Bouton pour lancer les tests (ouvrir Pure-JS-Tests) -->
  	<input 
      id="btn_test" 
      style="display:<?php echo ($mode_normal ? 'inline' : 'none') ?>;" 
      type="button" 
      value="-> TEST" 
      onclick="App.test()" />
    <!-- Bouton pour revenir au mode normal -->
    <input 
      id="btn_collection_originale" 
      style="display:<?php echo ($mode_normal ? 'none' : 'inline') ?>;" 
      type="button"
      value="-> Mode Normal" onclick="App.mode_normal()" />
  </div>
  
  <!-- BOUTONS OUTILS POUR AJOUTER PAGE, BOOK, ETC. -->
  <div id="header_card_tools">
    <?php 
      $table = array('book'=>"Book", 'chap' => "Chapter", 'page'=> "Page", 'para'=> "Paragraph");
      foreach($table as $type => $name) { ?>
      <div 
        id="card_tool-<?php echo $type ?>" 
        class="card_tool <?php echo $type ?>" 
        data-type="<?php echo $type ?>"
        ><?php echo $name ?></div>
    <?php } ?>
  </div>
</section>
