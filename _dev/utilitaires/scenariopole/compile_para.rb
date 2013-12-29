=begin

Script pour "compiler" plusieurs paragraphes à un seul
Par exemple, les évènemenciers brut (écrits dans la page) ont été
enregistrés en plusieurs paragraphes. On peut les rassembler en un seul
grâce à ce script.

=end
# current_owner = Process::uid
current_owner = 501 # = philippeperret
# current_owner = File.stat("./collection/scenariopole/fiche/book/0.msh").uid
puts "current_owner : #{current_owner}"
# puts File.stat("./collection/scenariopole/fiche/book/0.msh").gid 
# exit(0)

# === Définition de la compilation ===
# ---
# Paragraphes à compiler (soit un range, soit un array)
# NOTE: Il faut absolument que ce soit une liste de nombre et rien d'autre
# LISTE_PARAGRAPHES = [1,12,236]
LISTE_PARAGRAPHES = (27..46).to_a
# ---
# Le nouveau ptype du paragraphe (qui doit OBLIGATOIREMENT accepté les
# retours chariot, comme les listes ou les évènemenciers bruts
# — cf. PARAGRAPHS.PTYPES pour détail)
NEW_PTYPE = 'tabl'
# ---
# Méthode optionnelle de traitement du code final
# Retourner simplement le code s'il n'y a rien à faire
def traite_code_final code
  # return code
  code.strip[1..-2] # pour supprimer les "{" et "}"
end
# === Fin de la définition ===

Dir["./ruby/model/*.rb"].each do |m| require m end
require './data/secret/data_phil' # => DATA_PHIL

# Définition de la collection courante
# @note: Ça ne change pas le fichier .current
Collection::define_name 'scenariopole'

# Définit le possesseur des dossiers jusqu'au dossier 'para' et 'page'
def set_owner_folders_to owner
  puts `echo '#{DATA_PHIL[:password]}' | sudo -S chown -R #{owner} ./collection`
  if $?.to_i != 0
    puts "# IMPOSSIBLE DE CHANGER L'OWNER…"
  end
end

# Fabrique le dossier temporaire si nécessaire
def make_dir_tmp
  Dir.mkdir('./tmp', 0777) unless File.exists?('./tmp')
end
# Retourne le path au fichier temporaire du paragraphe +para+ ({Fiche})
def path_tmp para
  File.join('.', 'tmp', "#{para.id}.msh")
end
# Déplacer le paragraphe vers le dossier provisoire
def move_to_tmp_folder para
  `echo '#{DATA_PHIL[:password]}' | sudo -S mv '#{para.path}' '#{path_tmp para}'`
end
# Remettre les paragraphes à leur place
def demove_from_tmp_folder para
  `echo '#{DATA_PHIL[:password]}' | sudo -S mv '#{path_tmp para}' '#{para.path}'`
end
# Détruit les fichiers du dossier tmp
def erase_paragraphes
  `echo '#{DATA_PHIL[:password]}' | sudo -S rm -rf ./tmp/`
end

set_owner_folders_to current_owner

make_dir_tmp
errors = []
old_children = nil # pour savoir s'il y a eu modification
texte_original_first_paragraph = nil # idem
begin

  # Rassembler le texte
  # -------------------
  texte_final = ""
  first_para  = nil
  page_paras  = nil
  liste_instances_moved = []
  LISTE_PARAGRAPHES.each do |pid|
    para = Fiche.new pid, 'para'
    # passer les paragraphes introuvables
    unless para.exists?
      puts "### Paragraphe inconnu : #{pid}"
      next
    end
    # Prendre le premier paragraphe
    if first_para.nil?
      first_para = para
      texte_para = para.main_value
      texte_original_first_paragraph = "#{texte_para}"
      page_paras = para.parent
      if page_paras.nil?
        puts "Le paragraphe #{first_para.id} doit avoir un parent !" 
        raise
      end
    else
      # Le paragraphe doit avoir le même parent
      if para.parent.id != page_paras.id
        raise "### Impossible de rassembler des paragraphes qui n'ont pas le même parent."
      end
      # On prend le texte du paragraphe et on le détruit (provisoirement)
      texte_para = para.main_value
      move_to_tmp_folder para
      liste_instances_moved << para
    end
    texte_final << "#{texte_para}\n"
  end

  # Traitement à effectuer sur le code final
  # ----------------------------------------
  texte_final = traite_code_final texte_final
  puts "Texte final :"
  puts texte_final

  # Modifier le premier paragraphe
  # ------------------------------
  first_para.set_owner_to current_owner
  first_para.merge({'texte' => texte_final, 'ptype' => NEW_PTYPE})
  first_para.set_owner_to '_www'

  # Modifier les enfants du parent
  # ------------------------------
  old_children = page_paras.children
  new_children = []
  # Il faut retirer le premier paragraphe, qui restera dans la page
  LISTE_PARAGRAPHES.shift
  page_paras.children.each do |dpara|
    if LISTE_PARAGRAPHES.index(dpara['id'].to_i).nil?
      new_children << dpara
    end
  end
  # Actualisation des enfants du parent (les paragraphes de la page)
  page_paras.set_owner_to current_owner
  page_paras.merge( {'enfants' => new_children} )
  page_paras.set_owner_to '_www'
  
rescue Exception => e
  errors << (e.message + "\n" + e.backtrace.join("\n"))
end

# S'il y a eu un problème, il faut remettre les paragraphes en place
# Sinon, on les détruit
if errors.count == 0
  erase_paragraphes
  puts "\n*** Opération exécutée avec succès ! ***"
  puts "*** Recharger dans le navigateur pour voir les changements"
else
  puts "\n### ERREURS ###"
  puts "# " + errors.join("\n# ")
  if liste_instances_moved.length > 0
    liste_instances_moved.each do |para|
      demove_from_tmp_folder para
    end
    puts "Paragraphes remis en place"
  end
  puts 
  # Remettre le texte original du premier paragraphe
  unless texte_original_first_paragraph.nil?
    first_para.set_owner_to current_owner
    first_para.merge({'texte' => texte_original_first_paragraph, 'ptype' => 'text'})
    first_para.set_owner_to '_www'
    puts "Texte original remis dans premier paragraphe"
  end
  # Remettre les enfants originaux du parent
  unless old_children.nil?
    page_paras.set_owner_to current_owner
    page_paras.merge( {'enfants' => old_children} )
    page_paras.set_owner_to '_www'
    puts "Anciens enfants remis dans la page"
  end
end

set_owner_folders_to '_www'
