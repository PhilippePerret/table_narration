#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

# Affiche les données d'une fiche

# == Data de la fiche à voir ==
# FOLDER_COLLECTION = "narration"
# FICHE_TYPE  = 'chap'
# FICHE_ID    = 49
# FICHE_TYPE  = 'page'
# FICHE_ID    = 121

FOLDER_COLLECTION = "scenariopole"
FICHE_TYPE  = 'chap'
FICHE_ID    = 12


# == / Data ==

FICHE_PATH  = File.join('collection', FOLDER_COLLECTION, 'fiche', FICHE_TYPE, "#{FICHE_ID}.msh")
def data_fiche_in_file
  Marshal.load(File.read(FICHE_PATH))
end

data_fiche_in_file.each do |k, v|
  puts "#{k.inspect}: #{v.inspect}"
end
