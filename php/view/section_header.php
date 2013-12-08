<section id="header">
  <?php
  $mode_normal = file_exists('./.mode_test') == false
  ?>
  <?php
  // -- Marque de sauvegarde de la collection --
  ?>
  <div id="mark_saved" class="fleft">
    <span id="mark_saved_no" style="display:none;" onclick="Collection.save">🔴</span>
    <span id="mark_saved_yes">🔵</span>
    <span id="mark_saved_forbidden" style="display:none;font-size:1.3em;">⛔</span>
    <!-- CB d'enregistrement automatique -->
  </div>
  <?php
    // --- BOUTONS À DROITE ---
    // 
    // Note:  Les plus en haut seront les plus à gauche
  ?>
  <div id="buttons_right">
    <!-- Affichage des raccourcis-clavier -->
    <input 
      type="button"
      id="btn_toggle_shortcuts"
      value="Shortcuts"
      onclick="$('table#shortcuts_panel').toggle()"
      />
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
      value="---> TEST" 
      onclick="App.test()" />
    <!-- Bouton pour revenir au mode normal -->
    <input 
      id="btn_collection_originale" 
      style="display:<?php echo ($mode_normal ? 'none' : 'inline') ?>;" 
      type="button"
      value="---> Mode Normal" onclick="App.mode_normal()" />
  </div>
  
  <div id="div_automatic_save" style="display:inline-block;">
    <input 
      type="checkbox" 
      id="cb_automatic_save"
      onclick="Collection.enable_automatic_saving(this.checked)"
       />
    <label for="cb_automatic_save">Auto</label>
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
  <!-- AIDE RACCOURCIS-CLAVIER -->
  <?php include "./php/view/shortcuts_panel.php" ?>
</section>
