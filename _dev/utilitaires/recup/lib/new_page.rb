=begin

Class NPage
-----------
Pour construire les nouvelles pages à partir des anciennes

=end
RETOUR_AJAX = {:film_process => []} unless defined?(RETOUR_AJAX)

require '../interdata/film/ruby/model/film'
require '../interdata/scenodico/ruby/model/mot'

class NPage # Classe pour une nouvelle page

  ERRORS = {
    'formated unfound' => "La page d'identifiant {pid} est introuvable (dans {path})",
    'chap unfound' => "Le chapitre d'identifiant \#{chap} est inconnu de la collection Narration…"+
                      "\n# Il est impératif de donner l'identifiant du chapitre dans lequel insérer la page",
    'unable with only javascript' => "Impossible d'insérer une page composée seulement de javascript."
  }

  class << self
    attr_reader :errors
    
    def error err, params = nil
      @errors ||= []
      err = ERRORS[err] unless ERRORS[err].nil?
      params.each{|k,v| err.gsub!(/\{#{k.to_s}\}/, v.to_s)} unless params.nil?
      @errors << err
    end
    
    # == Main ==
    # Ajout d'une page de l'ancienne version à la nouvelle
    # 
    # @param {Number} pid Identifiant de la page (un nombre)
    def add_to_narration pid, chap_id
      path_formated = OPage::formated_page(pid)
      return if page_formated_doesnt_exists? path_formated
      return if chapitre_doesnt_exists? chap_id
      # La page formatée existe, on la traite
      new(path_formated, pid).insert_in_narration chap_id
    end
    
    # Return FALSE si la page préformatée EXISTE
    def page_formated_doesnt_exists? path_formated
      unless File.exists? path_formated
        error 'formated unfound', {:pid => pid, :path => path_formated}
        return true
      end
      return false
    end
    
    # Return FALSE si le chapitre EXISTE
    def chapitre_doesnt_exists? chap_id
      if File.exists? path_chapter(chap_id)
        return false
      else
        error 'chap unfound', {:chap => chap_id}
        return true
      end
    end
    
    # Retourne le path au chapitre chap_id
    def path_chapter chap_id
      File.join(folder_narration, 'fiche', 'chap', "#{chap_id}.msh")
    end
    
    def folder_narration
      @folder_narration ||= File.expand_path(File.join('.', 'collection', 'narration'))
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------

  # Path au fichier de la page pré-formaté
  # 
  attr_reader :path_formated
  
  # Identifiant numérique de la page
  # 
  attr_reader :id
  
  # Identifiant du chapitre dans lequel insérer la page
  # 
  attr_reader :chap_id
  
  # Les data de la page (entête du fichier préformaté)
  # 
  attr_reader :data
  
  def initialize path, id
    @path_formated = path
    @id   = id
  end
  
  # Raccourci
  def error err, params = nil
    self.class err, params
  end
  
  # == Main ==
  # Fonction principale qui fait de la page demandée une page
  # de la collection Narration
  # 
  # @param  {Integer} chap_id   Le chapitre dans lequel il faut insérer la page
  # 
  def insert_in_narration chap_id
    @chap_id = chap_id
    parse
    puts "* Insertion de la page “#{data[:titre_page]}” dans le chapitre #{chap_id}"
    return error('unable with only javascript') if @data[:only_javascript]
    puts @data.inspect
  end
  
  def parse
    @data = {
      :titre_page       => nil,
      :resume_page      => nil,
      :created_at       => nil,
      :niveau_devel     => nil,
      :contents_php     => false, 
      :only_javascript  => false
    }
    File.read(path_formated).each_line do |line|
      dline = line.strip.split('::')
      next if dline.count == 0 # ne devrait pas arriver
      motun = dline.shift
      tline = dline.join('::')
      tline = nil if tline == ""
      case motun
      when 'titre_page'   then @data[:titre_page]      = tline
      when 'resume_page'  then @data[:resume_page]     = tline
      when 'created_at'   then @data[:created_at]      = (tline || Time.now).to_i
      when 'old_dev'      then @data[:niveau_devel]    = tline.to_i
      when 'CONTENTS_PHP' then @data[:contents_php]    = true
      when 'ONLY_JS'      then @data[:only_javascript] = true
      else
        # Autre donnée
        case motun
        when 'titre'
          # Un titre (note : tline est constitué de <niveau titre>::<titre>)
          # + Le titre peut être composé de <titre>|<ancre>
        when 'not_printed'
          # Un paragraphe non imprimé
        when 'note'
          # Une note
        when 'onlywebmaster'
          # Un paragraphe seulement pour le webmaster
          # Inutilisé : c'est un paragraphe marqué not_printed
        else
          # Tout le reste, ce sont des paragraphes normaux
        end
      end
    end
  end
  
end