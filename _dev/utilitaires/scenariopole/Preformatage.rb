=begin

Module de récupération des pages du cours Narration en ligne

PREMIÈRE ÉTAPE DE PRÉFORMATAGE

Ce module s'occupe de prendre les anciens code dans les fichiers :
    `xarchive/livre_en_ligne/page/texte/f<id>.htm`
… et les données dans 
    `xarchive/livre_en_ligne/page/data/f<id>.js`
… et de composer les textes pré-formatés dans :
    `xarchive/livre_en_ligne/page/preformat_collection/f<id>.txt`

Ces textes doivent permettre de composer ensuite les pages de la collection.
Ils ne contiennent plus aucune ancienne balise et tous les identifiants ont été
corrigés ainsi que les balises.
Par exemple :
  <personnage>Selma Jezkova</personnage>
… a été transformé en :
  [personnage:Selma Jezkova]

Il reste néanmoins à l'intérieur de ces pages des liens et des appels à méthode
non encore corrigés et qui devront l'être.


Cf. Insertion.rb pour la suite à donner.

=end



THIS_FOLDER = File.dirname(__FILE__)
Dir["#{THIS_FOLDER}/lib/*.rb"].each { |m| require m }


# Pour voir la liste des films enregistrés
# puts Film::prepare_films.inspect
# exit(256)

# Pour lire la table de correspondance entre les anciens id de mot
# et les nouveaux
Mot::tables_correspondance_old_new

# Boucle sur toutes les anciennes pages
# Principes
# ---------
#   * On ne traite la page que si sa page préformée n'existe pas
#   * On s'arrête dès qu'une erreur est rencontrée
Dir["#{OPage::folder_textes}/*.htm"].each do |path|
  pid = File.basename(path, File.extname(path))[1..-1].to_i

  # pid = 10 # debug

  STDOUT.write "Traitement page #{pid}"
  opage = OPage.new pid
  if opage.formated? # sera mis à faux si l'original a été modifié
    puts " -> OK"
    next
  end
  puts " -> doit être traitée"

  # Pour débugger : 
  # break if pid > 3
  
  # Premier temps : on prend le code d'origine et on le préformate
  # Ce code sera enregistré dans le dossier
  puts "*** Code brut ***"
  puts opage.code
  puts "\n*** Code pré-formaté ***"
  reformated_texte = opage.parse_and_save
  puts reformated_texte
  puts "*** / Fin code pré-formaté ***"

  unless OPage::errors.nil?
    puts "\n\n### ERREURS RENCONTRÉES ###"
    puts '# ' + OPage::errors.join("\n# ")
    puts "# MODIFIER LE CODE ORIGINAL DE texte/f#{pid}.htm PUIS RELANCER."
    puts "\n@NOTE: J'ai détruit le fichier pour qu'il soit parsé à nouveau"
    File.unlink opage.path_formated
    break
  end
  
  # break
end