=begin

Ce module permet d'insérer les anciennes pages dans le livre

=end

# Identifiant de la page à afficher ou à insérer
# Commenter cette ligne pour voir la liste
PAGE_ID = 128
# Si PAGE_ID est commenté, c'est la liste de toutes les pages qui s'affiche
SHOW_LIST = true
# On peut ajouter un filtre sur le titre (expression régulière) pour ne voir
# que certains titres
FILTRE_TITRE = /Introduction à l'exposition/i

# SENSIBLE
# Mettre à true pour construire la page définie par PAGE_ID ci-dessus
# La donnée étant particulièrement sensible (elle peut mettre le bazard dans la
# collection), une clé de confirmation est demandée, à mettre dans KEY_CONFIRMATION
CONSTRUIRE_PAGE  = false
IN_CHAPTER       = 35
KEY_CONFIRMATION = 1388263025


THIS_FOLDER = File.dirname(__FILE__)
Dir["#{THIS_FOLDER}/lib/*.rb"].each { |m| require m }


if CONSTRUIRE_PAGE
  if File.exists? './keyconfirm'
    key_conf = File.read('./keyconfirm')
    
    # REMETTRE IMPÉRATIVEMENT CETTE LIGNE QUAND TOUT SERA OK
    # Elle permet de demander une confirmation avant insertion
    # File.unlink './keyconfirm'
    
    
    if key_conf.to_i == KEY_CONFIRMATION
      # Confirmation OK, la page va être ajoutée à la table Narration
      NPage::add_to_narration PAGE_ID, IN_CHAPTER
      if NPage::errors && NPage::errors.count > 0
        puts "\n### ERREURS RENCONTRÉES ###"
        puts '# ' + NPage::errors.join("\n# ")
      end
    else
      # Erreur de clé de confirmation
      puts "### La clé de confirmation ne matche pas, je dois renoncer."
    end
  else
    key_conf = Time.now.to_i.to_s
    File.open('./keyconfirm', 'wb'){|f| f.write key_conf}
    puts "Cette opération doit être confirmée : mettre KEY_CONFIRMATION à #{key_conf}"
  end
elsif defined?(PAGE_ID)
  puts File.read(File.join(OPage::folder_preformated, "f#{PAGE_ID}.txt"))
elsif defined?(SHOW_LIST)
  # Affiche la liste de tous les titres de page
  ok = true
  Dir["#{OPage::folder_preformated}/*.txt"].each do |path|
    id = File.basename(path, File.extname(path))[1..-1]
    File.open(path) do |f| 
      titre = (f.readline).split('::')[1]
      ok = (titre =~ FILTRE_TITRE) if defined?(FILTRE_TITRE)
      puts "#{id}:#{titre}" if ok
    end
  end
  puts "\n\nCopier l'identifiant numérique dans PAGE_ID pour voir la page"
end