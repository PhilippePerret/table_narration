#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Test sur les données film

=end
# require '../interdata/ruby/model/film'

require 'json'
require '../lib/ruby/extension/hash'
require '../lib/ruby/extension/array'

class Film
  class << self
    
    # Actualise la liste JS des films => FILMS et FILM_IDS
    # 
    # NOTES
    # -----
    #   ::  Le fichier contenant ces données se trouve dans
    #       `interdata/film/data_js/'
    # @param  ext   Extension de fichier à utiliser pour lire les données.
    #               Elles sont enregistrées au format JSON et MARSHAL
    def update_listes_js ext = 'js'
      data_film = {}
      Dir["#{folder_fiches_identite}/*.#{ext}"].each do |path|
        ifilm = Film.new path
        let = ifilm.id[0..0].ord
        let = 0 if let.between?(48, 57)
        data_film = data_film.merge(
        ifilm.id => {
          :id       => ifilm.id, 
          :let      => let,
          :titre    => ifilm.titre, 
          :titre_fr => ifilm.titre_fr, 
          :annee    => ifilm.annee}
        )
      end
      # On enregistre la donnée dans le fichier
      code = "FILMS.DATA = #{data_film.to_json}"
      File.open(File.join(folder_data_js, 'films_data.js'), 'wb'){|f| f.write code }
    end
    
    # Créer le fichier data jumeau de la fiche d'identité
    # (pour qu'elles se trouvent dans les deux formats, json et marshal)
    def build_needed_twins
      Dir["#{folder_fiches_identite}/*.#{ext}"].each do |path|
        ifilm = Film.new path
        path_other = ifilm.marshal? ? ifilm.data_path_js : ifilm.data_path_msh
        unless File.exists? path_other
          ifilm.save_as ifilm.marshal? ? 'js' : 'msh'
        end
      end
    end
    
    # Path au dossier contenant les FICHES D'IDENTITÉ
    # 
    def folder_fiches_identite
      @folder_fiches_identite ||= File.join(folder, 'fiches_identite')
    end
    
    # Path au dossier contenant les DATA JS
    # 
    def folder_data_js
      @folder_data_js ||= begin
        d = File.join(folder, 'data_js')
        Dir.mkdir(d, 0777) unless File.exists? d
        d
      end
    end
    
    # Path au dossier principal contenant TOUTES les données des films
    # 
    def folder
      @folder ||= File.join('..', 'interdata', 'film')
    end
  end
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  
  # Path au fichier d'identité
  # 
  attr_reader :path
  
  # Nom du fichier
  # 
  attr_reader :filename
  
  
  def initialize path
    @path = path
    @filename = File.basename path
  end
  
  # Sauve les données dans le format spécifié par +extension+
  # 
  # @param  extension   Extension du fichier ('js' ou 'msh')
  def save_as extension
    case extension
    when 'js' then File.open(data_path_js, 'wb'){|f| f.write data.to_json}
    when 'msh'  then File.open(data_path_msh, 'wb'){|f| f.write Marshal.dump(data) }
    else throw "Format d'enregistrement .#{extension} inconnu…"
    end
  end
  
  # Données (raccourcis)
  def id;       @id       ||= data[:id]         end
  def titre;    @titre    ||= data[:titre]      end
  def titre_fr; @titre_fr ||= data[:titre_fr]   end
  def annee;    @annee    ||= data[:annee].to_i end
  
  def data
    @data ||= get_data
  end
  
  def get_data
    if javascript?
      JSON.parse(File.read path).to_sym
    elsif marshal?
      Marshal.load(File.read path)
    else
      throw "Impossible de traiter les données de #{path} (extension inconnue)"
    end
  end
  
  def javascript?
    @is_javascript ||= (filename.end_with? '.js')
  end
  def marshal?
    @is_marshal ||= (filename.end_with? '.msh')
  end
  
  def data_path_js
    @data_path_js ||= File.join(self.class::folder_fiches_identite, "#{id}.js")
  end
  def data_path_msh
    @data_path_msh ||= File.join(self.class::folder_fiches_identite, "#{id}.msh")
  end
end

unless File.exists? Film::folder
  puts "Le dossier `interdata/film` est malheureusement introuvable."
  root_folder = File.expand_path('.')
  root_folder    = root_folder.split('/')[0..-2].join('/')
  puts "Le charger depuis Github et le placer dans `#{root_folder}/'"
  exit(256)
end

Film::update_listes_js