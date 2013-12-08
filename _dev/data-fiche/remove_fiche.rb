#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

# Détruit une fiche

FOLDER_COLLECTION = "test" # "current"
FICHE_TYPE  = 'page'
FICHE_ID    = 3
FICHE_PATH  = File.join('collection', FOLDER_COLLECTION, 'fiche', FICHE_TYPE, "#{FICHE_ID}.msh")

if File.exists? FICHE_PATH
  require './data/secret/data_phil'
  `echo "#{DATA_PHIL[:password]}" | sudo -S rm #{FICHE_PATH}`
  unless File.exists? FICHE_PATH
    puts "Fiche #{FICHE_PATH} détruite"
  else
    puts "La fiche #{FICHE_PATH} n'a pas pu être détruite"
  end
else
  puts "LA FICHE #{FICHE_PATH} est introuvable"
end