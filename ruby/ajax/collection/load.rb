#encoding: UTF-8
=begin

Chargement de la collection (normale ou test)
---------------------------------------------

Ce script retourne toutes les informations utiles pour l'affichage de la collection

=end

# Collection::folder (dossier courant)

# Dans le cas où le dossier n'existerait pas, on le crée avec tout ce qui 
# est nécessaire
load './ruby/module/prepare_folder.rb' unless File.exists? Collection::folder

