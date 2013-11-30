#encoding: UTF-8

=begin

Préparation du dossier courant

=end

# Dossier principal
Dir.mkdir(Collection::folder, 0755)

# Dossier des fiches
Dir.mkdir(Fiche::folder, 0755)
['book', 'chap', 'page', 'para'].each do |type|
  Dir.mkdir(File.join(Fiche::folder, type), 0755)
end

# Dossier des listes
Dir.mkdir(Collection::folder_listes, 0755)