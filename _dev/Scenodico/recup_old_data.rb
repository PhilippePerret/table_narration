#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Pour récupérer les données anciennes et les convertir en nouvelles

=end
require 'json'
require '../lib/ruby/extension/array'
require '../lib/ruby/extension/hash'
# require '../interdata/film/ruby/model/dico'

FOLDER_OLD = "../scenodico-old/mots"

class Mot
  
  class << self
    attr_reader :tbl
    attr_reader :idnum_to_id
    attr_reader :categories
    
    def add id, inst
      @tbl          ||= {}
      @idnum_to_id  ||= {}
      @tbl          = @tbl.merge( id => inst)
      @idnum_to_id  = @idnum_to_id.merge( inst.num.to_i => id)
    end
    
    def add_categories arr
      @categories ||= []
      @categories += arr
    end
    
    def exists? id
      @tbl ||= {}
      @tbl[id] != nil
    end
    
    def folder_ruby
      folder_ruby ||= (getfolder File.join(folder, 'ruby'))
    end
    def folder_data_js
      @folder_data_js ||= (getfolder File.join(folder, 'data_js'))
    end
    def folder_mots
      @folder_mots ||= (getfolder File.join(folder, 'mots'))
    end
    def folder_backup
      @folder_backup ||= (getfolder File.join(folder, 'backup'))
    end
    
    def folder
      @folder ||= (getfolder File.join('..', 'interdata', 'scenodico'))
    end
    
    def build_folders
      folder
      folder_backup
      folder_mots
      folder_data_js
      folder_ruby
      getfolder File.join(folder_ruby, 'model')
      getfolder File.join(folder_ruby, 'module')
    end
    
    def getfolder path
      Dir.mkdir(path, 0777) unless File.exists? path
      path
    end
  end
  
  # ---------------------------------------------------------------------
  #   INSTANCE
  # ---------------------------------------------------------------------
  attr_reader :opath
  
  def initialize opath
    @opath = opath
  end
  
  def num
    @num ||= File.basename(opath, File.extname(opath))[1..-1]
  end
  
  def data
    @data ||= Marshal.load(File.read path)
  end
  
  def odata
    @odata ||= JSON.parse(File.read opath).to_sym
  end
  
  def mot; odata[:mot] end
  def categorie; odata[:categorie]   end
  def relatifs; odata[:relatifs]     end
  def synonymes; odata[:synonymes]   end
  def contraires; odata[:contraires] end
  
  def let
    @let ||= id[0..0].ord
  end
  
  def id
    @id ||= mot_to_id
  end
  
  def path
    @path ||= File.join(self.class.folder_mots, "#{id}.msh")
  end
  
  def mot_to_id
    id = "#{mot}"
    id = id.gsub(/[\(\)]/, '').gsub(/['’\-]/, ' ')
    id = id.force_encoding('UTF-8').tr('éèêeë','e').tr('ÉÈÊË','E').
          tr('àâä', 'a').tr('ÀÂÄ', 'A').
          tr('îïì', 'i').tr('ÎÏÌ', 'I').
          tr('ç', 'c').tr('Ç', 'C').
          tr('œ', 'oe').tr('Œ', 'OE').
          tr('ûüù', 'u').tr('ÛÜÙ', 'U')
    id = id.split.collect{|el| el.capitalize}.join('')
    raise "### PROBLÈME DE CARACTÈRE AVEC : #{mot}" if id.gsub(/[aA-zZ0-9]/,'') != ""
    id_alt = id
    id = id[0..6]
    if self.class.exists? id
      (7..id_alt.length).each do |x|
        id = id_alt[0..x]
        break unless self.class.exists? id
      end
      if self.class.exists? id
        raise "### Impossible de trouver un id pour #{mot}…"
      end
    end
    self.class.add id, self
    id
  end
end


def put_mots_in_table
  counter = 0
  # Création des tables
  # 
  Dir["#{FOLDER_OLD}/*"].each do |opath|
    counter += 1
    mot = Mot.new opath
    puts "#{mot.num}: let:#{mot.let} id:#{mot.id} (#{mot.mot})"
    # puts "#{mot.odata}"
    # break
  end  
  puts "\n\n#{counter} mots traités"
end

def remplace_idnum_par_realid
  puts "\n\nRemplacement des id nombres"
  [:relatifs, :contraires, :synonymes].each do |prop|
    Mot::tbl.each do |mid, imot|
      if imot.odata[prop] == ""
        imot.odata[prop] = nil
      elsif imot.odata[prop] != nil
        new_value = []
        imot.odata[prop].each do |idnum|
          next if idnum.to_s == ""
          idreal = Mot::idnum_to_id[idnum.to_i]
          raise "Dans #{imot.mot}:#{imot.num} Impossible de trouver l'id réel de #{idnum}" if idreal.nil?
          new_value << idreal
          puts "Dans #{imot.mot} : #{idnum} remplacé par #{idreal}"
        end
        new_value = nil if new_value.count == 0
        imot.odata[prop] = new_value
        puts "#{imot.mot}[new #{prop}] : #{imot.odata[prop].inspect}"
      end
    end
  end
end

def epure_categories
  Mot::tbl.each do |mid, imot|
    next if imot.categorie == nil
    imot.odata[:categorie] = imot.categorie.reject{|el| el == "XXXX"}
    imot.odata[:categorie] = nil if imot.odata[:categorie].count == 0
    Mot::add_categories imot.odata[:categorie] unless imot.odata[:categorie].nil?
    puts "#{imot.mot}.categorie : #{imot.categorie.inspect}"
  end
end

# Corrige les idnum dans les définitions
# 
def correct_idnum_in_definition
  Mot::tbl.each do |mid, imot|
    imot.odata[:definition].gsub!(/MOT\[([0-9]+)\|([^\]]+)\]/u){
      tout  = $&
      idnum = $1
      terme = $2
      id    = Mot::idnum_to_id[idnum.to_i]
      newbal = "[mot:#{id}|#{terme}]"
      # puts "Old: #{$&} / New: #{newbal}"
      newbal
    }
  end  
end
# Création des fichiers finaux
# 
def create_files
  Mot::tbl.each do |mid, imot|
    imot.odata.delete(:ancre)
    imot.odata[:id] = imot.id
    File.unlink imot.path if File.exists? imot.path
    File.open(imot.path, 'wb'){|f| f.write(Marshal.dump imot.odata)}
    # break
  end
end

def browse_all_mots
  put_mots_in_table
  remplace_idnum_par_realid
  epure_categories
  correct_idnum_in_definition
  create_files
end

# Construction de tous les dossiers si nécessaire
unless File.exists?(File.join('..', 'interdata', 'scenodico'))
  Mot::build_folders 
  puts "Tous les dossiers ont été construits"
end
browse_all_mots

# puts Mot::idnum_to_id.inspect