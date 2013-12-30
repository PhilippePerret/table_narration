=begin

Script permettant de prendre une page des anciens cours et de la
coller dans les nouveaux cours.

Utilisation
-----------
  * Ouvrir la collection "Scénariopole" sur la table
  * Relever l'identifiant de la page dans la collection Scénariopole
    @NOTE: Pour obtenir cet identifiant simplement, cocher dans les préférences
    la CB “Afficher type:id dans pied de page”. L'identifiant de la fiche 
    sélectionnée s'affiche alors en bas à gauche de la fenêtre Firefox
  * Renseigner la constante `ID_PAGE_SRC` ci-dessous avec cet identifiant

  * Ouvrir la collection "Narration" sur la table
    @WARNING: Ne pas ouvrir les deux collections dans deux fenêtres distinctes
    pour le moment, ça entraînerait des erreurs.
  * Prendre l'identifiant du CHAPITRE dans lequel insérer la page
  * Renseignement la constante `ID_CHAPITRE_DEST` avec cet identifiant.

  * Si la page doit être insérée AVANT une page du chapitre :
    * relever l'identifiant de cette page.
    * Renseigner la constante `BEFORE_PAGE_ID` ci-dessous avec cet identifiant
  * Sinon, mettre `BEFORE_PAGE_ID` à nil

  * Lancer ce script (Pomme+R)

Notes
-----
  @ Ne fonctionne que pour les pages
  @ Fonctionne comme une transaction : si le script rencontre une erreur, tous
    les éléments sont remis en place.

=end

# ---------------------------------------------------------------------
# === Définition du déplacement ===

# Identifiant de la page dans les anciens cours
ID_PAGE_SRC = nil

# Identifiant du chapitre dans lequel mettre la page
ID_CHAPITRE_DEST = nil
# Optionnellement, on peut indiquer l'identifiant de la page avant laquelle
# mettre la page déplacée. Sans cette indication, la page sera ajoutée à
# la fin
BEFORE_PAGE_ID = nil

# === / Fin définition du déplacement ===
# ---------------------------------------------------------------------



current_owner     = 501 # = philippeperret
owner_collection  = File.stat("./collection/scenariopole/fiche/book/0.msh").uid
puts "Owner du script courant : #{current_owner}"
puts "Owner des fichiers de la collection : #{owner_collection}"

# Les librairies requises, + les data secrètes
# Dir["./ruby/model/*.rb"].each do |m| require m end
require './data/secret/data_phil' # => DATA_PHIL

=begin

Déplacer une page consiste à :
  - Retirer la page du chapitre de Scénariopole
    > Charger les données de la page voulue
    > Trouver son parent (chapitre) et retirer la page du parent
    > Trouver un nouvel identifiant pour la page source
    > Déplacer la page dans le dossier collection
    > Déplacer tous les enfants de la page dans le dossier collection
      en leur trouvant un nouvel identifiant.
    > Ajouter la page au chapitre de destination
=end
def folder_fiches_scenariopole
  @folder_fiches_scenariopole ||= File.join('.','collection', 'scenariopole', 'fiche')
end
def folder_fiches_narration
  @folder_fiches_narration ||= File.join('.', 'collection', 'narration', 'fiche')
end
def path_of_fiche collection, type, id
  File.join('.', 'collection', collection, type, "#{id}.msh")
end
def load_data path
  raise "Fichier #{path} introuvable. Impossible de prendre ses données" unless File.exists? path
  Marshal.load(File.read path)
end
def save_data path, data
  File.unlink path if File.exists? path
  File.open(path, 'wb'){|f| f.write (Marshal.dump data)}
end


# Définit le possesseur des dossiers jusqu'au dossier 'para' et 'page'
def set_owner_of_to collection, owner
  `echo '#{DATA_PHIL[:password]}' | sudo -S chown -R #{owner} ./collection/#{collection}`
  if $?.to_i != 0
    raise "# IMPOSSIBLE DE CHANGER L'OWNER…"
  end
end
# Change le possesseur des deux dossier 'scenariopole' et 'narration'
def change_owner owner
  set_owner_of_to 'scenariopole', owner
  set_owner_of_to 'narration', owner
end

# Path au fichier contenant le LAST_ID de narration
def path_last_id
  @path_last_id ||= File.join(folder_fiches_narration, 'LAST_ID')
end
# Nouvel identifiant pour l'élément
def get_new_id
  @last_id += 1
end

# --- Pour la transaction ---
init_dchap_source = nil
init_dpage_source = nil
init_dchap_destin = nil
errors = []

begin

  # --- Chargement des data (vérification de l'existence des éléments) ---
  path_page_source = path_of_fiche 'scenariopole', 'page', ID_PAGE_SRC
  data_page_source = load_data path_page_source
  puts "- Récupération des données de la page source OK"
  path_chap_source = path_of_fiche 'scenariopole', 'chap', data_page_source['parent']
  data_chap_source = load_data path_page_source
  puts "- Récupération des données du chapitre source OK"
  path_chap_destin = path_of_fiche 'narration', 'chap', ID_CHAPITRE_DEST
  data_chap_destin = load_data path_chap_destin
  puts "- Récupération des données du chapitre de destination OK"

  @last_id = (File.read path_last_id).to_i
  puts "- LAST_ID narration = #{@last_id}"

  change_owner 'philippeperret'
  puts "* Changement de propriétaire OK"

  # Retrait de la page de son chapitre source
  # -----------------------------------------
  init_dchap_source = load_data path_page_source # pour annuler la transaction
  new_children = []
  data_chap_source['enfants'].each do |dchild|
    next if dchild['id'] == ID_PAGE_SRC
    new_children << dchild
  end
  data_chap_source['enfants'] = new_children
  save_data path_chap_source, data_chap_source
  puts "* Retrait de la page du chapitre source OK"
  
  # Déplacement de tous les paragraphes de la page
  # source, en modifiant leur identifiant
  # ---------------------------------------------------------------------
  # Notes
  # -----
  #   @ En fait, on ne modifiant l'identifiant que si c'est nécessaire
  #   @ On le fait avant de traiter la page source, qui devra contenir
  #     la nouvelle liste d'enfants
  # 
  new_children_para = []
  puts "-> Déplacement des paragraphes (#{data_page_source['enfants'].count})…"
  data_page_source['enfants'].each do |dchild|
    path_src_child    = path_of_fiche 'scenariopole', 'para', dchild['id']
    dchild['id']      = get_new_id if dchild['id'].to_i <= @last_id
    path_des_child    = path_of_fiche 'narration', 'para', dchild['id']
    data_child        = load_data path_src_child
    data_child['id']  = dchild['id'] # peut-être le même
    save_data path_des_child, data_child
    File.unlink path_src_child
    puts "  > Déplacement du paragraphe #{data_child['id']} OK"
    new_children_para << dchild
  end
  puts "*** Déplacement des paragraphes dans la collection Narration OK ***"
  puts "LAST_ID narration = #{@last_id}"
  
  # Déplacement de la page dans le dossier source
  # ----------------------------------------------
  # Note : En fait, on enregistre les nouvelles données
  # dans une nouvelle page, sur Narration, et on détruit
  # l'ancien fichier
  PAGE_NEW_ID = get_new_id
  data_page_source['id']      = PAGE_NEW_ID
  data_page_source['enfants'] = new_children_para
  path_page_destin  = path_of_fiche 'narration', 'page', PAGE_NEW_ID
  init_dpage_source = load_data path_page_source # pour annuler transaction
  save_data path_page_destin, data_page_source
  File.unlink path_page_source
  puts "* Déplacement de la page dans la collection Narration OK"
  puts "- LAST_ID narration = #{@last_id}"
  
  # Ajout de la page au chapitre de destination
  # -------------------------------------------
  # => Modification du chapitre de destination
  inserted    = false
  new_dchild  = {'id' => PAGE_NEW_ID, 'type' => 'page'} 
  if defined? BEFORE_PAGE_ID
    new_children = []
    data_chap_destin['enfants'].each do |dchild|
      if dchild['id'] == BEFORE_PAGE_ID
        new_children << new_dchild
        inserted = true
        puts "* Page #{PAGE_NEW_ID} insérée avant #{BEFORE_PAGE_ID}"
      end
      new_children << dchild
    end
  end
  if inserted == false
    puts "* Page #{PAGE_NEW_ID} insérée à la fin du chapitre"
    data_chap_destin['enfants'] << new_dchild  
  end
  init_dchap_destin = load_data path_chap_destin # Pour annuler transaction
  save_data path_chap_destin, data_chap_destin
  puts "* Sauvegarde des données du chapitre de destination OK"
  
  # Il faut enregistrer le nouvel LAST_ID
  # -------------------------------------
  File.open(path_last_id, 'wb'){|f| f.write @last_id.to_s }
  puts "* Nouveau LAST_ID enregistré : #{@last_id}"
  
  
rescue Exception => e
  errors << "### ERREUR ###\n" +
            e.message + "\n" +
            e.backtrace.join("\n")
  
end


if errors.count > 0
  
  puts errors.join("\n")
  
  # On remet ce qu'il faut en place
  unless init_dchap_source.nil?
  end

  unless init_dchap_source.nil?
  end

  unless init_dchap_destin.nil?
  end
else
  puts "\n=== OPÉRATION EXÉCUTÉE AVEC SUCCÈS ! ==="
  puts "= Recharge la collection pour voir le résultat"
end

change_owner '_www'
puts "* Changement de propriétaire -> _www"

