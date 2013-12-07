#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

# Permet de modifier les données d'une fiche

# Mettre ici les changements à effectuer
CHANGE = {
  "enfants"  => [],
}

FOLDER_COLLECTION = "test" # "current"
FICHE_TYPE  = 'book'
FICHE_ID    = 0
FICHE_PATH  = File.join('collection', FOLDER_COLLECTION, 'fiche', FICHE_TYPE, "#{FICHE_ID}.msh")

def autorise path
  load_data_phil unless defined?(DATA_PHIL)
  `echo "#{DATA_PHIL[:password]}" | sudo -S chmod 0777 #{path}`  
end
def desautorise path
  `echo "#{DATA_PHIL[:password]}" | sudo -S chmod 0755 #{path}`  
end

def load_data_phil
  require './data/secret/data_phil'
end

def data_fiche_in_file
  Marshal.load(File.read(FICHE_PATH))
end

puts "Data d'origine"
@data_fiche = data_fiche_in_file
puts @data_fiche.inspect
@data_fiche.merge!(CHANGE)
autorise FICHE_PATH
File.open(FICHE_PATH, 'wb'){|f| f.write Marshal.dump(@data_fiche)}
desautorise FICHE_PATH
puts "Data modifiées"
puts data_fiche_in_file.inspect
