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
    <!-- Pour mémoriser la configuration courante -->
    <img
      src="../lib/img/device/camera/camera-3.png"
      onclick="$.proxy(App.save_current_configuration, App, forcer=true)()"
      title="Enregistrer la configuration courante pour la prochaine ouverture"
      />
    <!-- Pour forcer un backup -->
    <img
      id="btn_force_backup"
      src="../lib/img/picto/backup-fond-blanc.png"
      onclick="Collection.force_backup"
      title="Forcer l'enregistrement d'un backup complet de la collection courante"
      />
    <!-- Pour afficher les préférences -->
    <img
      id="btn_preferences"
      src="../lib/img/picto/preferences-fond-blanc.png"
      onclick="$.proxy(App.Prefs.show, App.Prefs)()"
      title="Affichage des préférences de l'application"
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
      $table = array(
        'book'=>"Book", 
        'chap' => "Chapter", 
        'page'=> "Page", 
        'para'=> "Paragraph");
      foreach($table as $type => $name) { ?>
      <div 
        id="card_tool-<?php echo $type ?>" 
        class="card_tool <?php echo $type ?>" 
        data-type="<?php echo $type ?>"
        ><?php echo $name ?></div>
    <?php } ?>
    <div id="div_bd_tool" style="display:inline-block;margin-left:1em;">
      <div
        id="card_tool-film"
        class="bd_tool"
        onclick="$.proxy(FILMS.Dom.show_panneau, FILMS.Dom)()"
        >Films</div>
      <div
        id="card_tool-film"
        class="bd_tool"
        onclick="$.proxy(FILMS.Dom.show_panneau, FILMS.Dom)()"
        >Dico</div>
    </div>
  </div>
</section>
