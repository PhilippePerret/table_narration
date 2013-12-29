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
  
  # La liste des paragraphes
  # 
  # C'est un {Array} contenant des Objets {:type, :texte} pour les paragraphes
  # et {:type => 'titre', :level => niveau de titre, :titre => le titre, 
  #     :ancre => l'ancre | Nil} pour les titre
  attr_reader :paragraphs
  
  def initialize path, id
    @path_formated = path
    @id   = id
  end
  
  # Raccourci
  def error err, params = nil
    self.class err, params
  end
  
  # == Main ==
  # Méthode créant tous les paragraphes de la page
  # 
  # @param {Number} npage_id    Identifiant de la page MAIS DANS LA COLLECTION
  #                             Car self.id renverrait l'identifiant dans les anciens 
  #                             cours.
  # @return La liste des enfants créées, où chaque élément est un objet
  #         {'id' => identifiant dans collection, 'type' => "para"}
  def create_paragraphs_of npage_id
    child_list = []
    parse
    paragraphs.each do |dpara|
      pid = self.class.get_new_id
      para = Fiche.new pid, 'para'
      data = {
        'id'          => pid,
        'type'        => 'para',
        'texte'       => dpara[:texte],
        'left'        => "200",
        'top'         => "100",
        'created_at'  => self.data[:created_at],
        'ptype'       => 'text',
        'parent'      => {'id' => npage_id.to_s, 'type' => 'page'}
      }
      case dpara[:type]
      when 'not_printed'  
        data = data.merge 'not_printed' => true
      when 'titre'
        data = data.merge 'style' => "titre_level_#{dpara[:level]}"
      when 'note'         
        data = data.merge 'style' => "note_redaction"
      when 'unknown'
        data = data.merge 'style' => "warning"
      end
      self.class.create_fiche para, data
      child_list << {'id' => para.id, 'type' => 'para'}
    end
    return child_list
  end
  
  # == Main ==
  # Fonction principale qui fait de la page demandée une page
  # de la collection Narration
  # TODO La méthode est complètement à implémenter
  # @param  {Integer} chap_id   Le chapitre dans lequel il faut insérer la page
  # 
  def insert_in_narration chap_id

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
    # Tous les paragraphes de la page
    @paragraphs = []
    File.read(path_formated).each_line do |line|
      line = line.strip
      if line.index('::')
        dline = line.strip.split('::')
        next if dline.count == 0 # ne devrait pas arriver
        motun = dline.shift.strip
        tline = dline.join('::').strip
        tline = nil if tline == ""
      else
        motun = 'paragraphe'
        tline = line
      end
      case motun
      when 'titre_page'   then @data[:titre_page]      = tline
      when 'resume_page'  then @data[:resume_page]     = tline
      when 'created_at'   then @data[:created_at]      = (tline || Time.now).to_i
      when 'old_dev'      then @data[:niveau_devel]    = tline.to_i
      when 'CONTENTS_PHP' then @data[:contents_php]    = true
      when 'ONLY_JS'      then @data[:only_javascript] = true
      else
        # Autre donnée => un paragraphe
        next if tline.nil?
        @paragraphs << case motun
        when 'titre'
          # Un titre (note : tline est constitué de <niveau titre>::<titre>)
          # + Le titre peut être composé de <titre>|<ancre>
          level, titre = tline.split('::')
          titre, ancre = titre.split('|')
          {:type => 'titre', :texte => titre, :level => level, :ancre => ancre}
        when 'not_printed'
          {:type => 'not_printed', :texte => tline}
        when 'note'
          {:type => 'note', :texte => tline}
        when 'paragraphe'
          {:type => 'text', :texte => tline}
        else
          # Tout le reste, ce sont des choses inconnues
          {:type => 'unknown', :texte => tline}
        end
      end
    end
  end
  
end