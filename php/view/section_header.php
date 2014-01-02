<section id="header">
  <?php
  // On est en mode "normal" si la collection courante n'est pas "test"
  $mode_normal = true ;
  if(file_exists('./.current'))
  {
    $mode_normal = file_get_contents('./.current') != "test";
  }
  ?>
  <?php
  // -- Marque de sauvegarde de la collection --
  ?>
  <div id="mark_saved" class="fleft">
    <span id="mark_saved_no" style="display:none;" onclick="$.proxy(Collection.save, Collection)()">🔴</span>
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
    <!-- Outil aide -->
    <img
      src="../lib/img/picto/help-fond-blanc.png"
      onclick="$.proxy(App.help, App)()"
      title="Ouvrir l'aide (dans une nouvelle fenêtre)"
      />
    <!-- Outil dupliquer (la page courante) -->
    <img
      src="../lib/img/picto/dupliquer-fond-blanc.png"
      onclick="$.proxy(App.dupliquer, App)()"
      title="Ouvrir un double de la collection dans une autre fenêtre (pour références)"
      />
    <!-- Outil recherche -->
    <img 
      src="../lib/img/picto/zoom-fond-blanc.png"
      onclick="$.proxy(Search.show, Search)()"
      title="Effectuer une recherche dans la collection"
      />
    <!-- Outil Mémo configuration -->
    <img
      src="../lib/img/device/camera/camera-3.png"
      onclick="$.proxy(App.save_current_configuration, App, forcer=true)()"
      title="Enregistrer la configuration courante pour la prochaine ouverture"
      />
    <!-- Outil backup -->
    <img
      id="btn_force_backup"
      src="../lib/img/picto/backup-fond-blanc.png"
      onclick="Collection.force_backup"
      title="Forcer l'enregistrement d'un backup complet de la collection courante"
      />
    <!-- Outil préférences -->
    <img
      id="btn_preferences"
      src="../lib/img/picto/preferences-fond-blanc.png"
      onclick="$.proxy(App.Prefs.show, App.Prefs)()"
      title="Affichage des préférences de l'application"
      />
    <!-- Menu collections -->
    <select
      id="collections"
      onchange="$.proxy(Collection.choose, Collection, this.value)()"
      ></select>
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
