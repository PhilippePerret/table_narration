=begin

Ce script permet de voir des pages et de rechercher parmi les titres
des pages des anciens cours.

=end

# Identifiant de la page à afficher ou à insérer
# Commenter cette ligne pour voir la liste des pages
# PAGE_ID = 128

# On peut ajouter un filtre sur le titre (expression régulière) pour ne voir
# que certains titres ou qu'un titre en particulier
# Note : Si PAGE_ID n'est pas commenté ci-dessus, c'est la page PAGE_ID qui 
# s'affichera
FILTRE_TITRE = /Introduction à l'exposition/i



THIS_FOLDER = File.dirname(__FILE__)
Dir["#{THIS_FOLDER}/lib/*.rb"].each { |m| require m }


if defined?(PAGE_ID)
  puts File.read(File.join(OPage::folder_preformated, "f#{PAGE_ID}.txt"))
else
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