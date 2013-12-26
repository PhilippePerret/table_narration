class Fiche
  require '../interdata/file/ruby/model/pfile.rb' # pour paragraphe de ptype 'file'
  
  # ---------------------------------------------------------------------
  #   Classe
  # ---------------------------------------------------------------------
  class << self
    
    # Dossier principal des fiches
    # 
    attr_accessor :folder
    
    # Récupère l'instance de la fiche d'identifiant +id+
    # 
    def get id, type = nil
      @list ||= {}
      fiche = @list[id.to_i]
      if fiche.nil? && type != nil
        fiche = new id, type
      end
      return fiche
    end
    
    # Ajoute l'instance {Fiche} +fiche+ à la liste des fiches instanciées
    # cf. initialize
    # 
    # @note   On peut ensuite récupérer cette fiche avec `get <id>'
    # @note   La clé est toujours un {Integer}
    # 
    def add fiche
      @list ||= {}
      @list = @list.merge fiche.id.to_i => fiche
    end
    
    # Retourne l'instance {Fiche} de la fiche de path +path+
    # 
    def get_fiche_with_path path
      dfiche = Marshal.load(File.read path)
      Fiche.new dfiche['id'], dfiche['type']
    end
        
    # Return le dernier ID utilisé pour une fiche (le plus grand)
    # 
    def last_id
      @last_id ||= begin
        if File.exists?(path_last_id) then File.read(path_last_id).to_i
        else - 1 end
      end
    end
    
    # Actualise le dernier ID enregistré
    def update_last_id new_id
      File.open(path_last_id, 'wb'){|f| f.write new_id }
    end
    
    # Retourne le path au fichier contenant le dernier ID
    # 
    def path_last_id
      @path_last_id ||= File.join(folder, 'LAST_ID')
    end
    
    # Return le path du fichier de la fiche de donnée +data_fiche+
    # +data_fiche+ doit contenir au minimum : 
    #   :id::     Son identifiant
    #   :type::   Son type (para, book, etc.)
    # OU data_fiche est l'identifiant et type le type
    def path_to data_fiche, type = nil
      id, type = 
      if type.nil? then [data_fiche['id'], data_fiche['type']]
      else [data_fiche, type] end
        
      File.join((folder_type type), "#{id}.msh")
    end
    
    # Return le path du dossier de type +type+ (fiches)
    def folder_type type
      type = type.to_sym
      @folders ||= {}
      if @folders[type].nil?
        d = @folders[type] = File.join(folder, type.to_s)
        Dir.mkdir(d, 0755) unless File.exists?(d)
      end
      @folders[type]
    end
    # Return le path du dossier principal des fiches
    def folder
      @folder ||= begin
        d = File.join(Collection::folder, 'fiche')
        Dir.mkdir(d, 0755) unless File.exists?(d)
        d
      end
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  attr_reader :id
  attr_reader :type
  
  # Pour savoir si la fiche est ouverte dans la configuration
  # actuelle.
  # 
  attr_accessor :is_opened
  
  # Pour savoir si la fiche est visible dans le fichier de configuration
  # courante
  # 
  attr_accessor :is_visible
    
  def initialize id, type
    @id   = id.to_i
    @type = type
    # On consigne cette fiche pour pouvoir la retriever par `Fiche::get <id>'
    self.class.add self
  end
  
  # Merge les données de la fiche avec les données transmises
  # 
  def merge hash_data
    @data = Marshal.load( File.read path )
    @data = @data.merge hash_data
    save
  end
  
  def save
    File.unlink path if File.exists? path
    @data['updated_at'] = Time.now
    File.open(path, 'wb'){|f| f.write (Marshal.dump @data)}
  end
  
  # Publication 
  # 
  # Notes
  # -----
  #   * La procédure n'est valide que pour un livre.
  #   * On se sert de RLatex pour construire le livre
  # 
  # @param  {Hash} options    Les options éventuelles :
  #         ::only_tdm:           Si true, seule la TdM est publiée.
  #         ::even_not_printed:   Si true, publie même les fiches marquées 
  #                               'not_printed'
  # 
  def publish options = nil
    begin
      $BOOK = self
      # Pas 'required' ci-dessous car on peut publier plusieurs livres
      # en boucle.
      # load File.join('.', 'publication', 'source', 'builder.rb')
      ENV['RLATEX_WORKING_FOLDER'] = File.expand_path(File.join('.', 'publication'))
      load File.join('','Users','philippeperret','Programmation', 'Programmes', 'RLatex', 'main.rb')
    rescue Exception => e
      # RETOUR_AJAX[:ok] = false
      # RETOUR_AJAX[:message] = e.message
      raise "#{e.message}\n#{e.backtrace.inspect}"
    end
    
  end
  # ---------------------------------------------------------------------
  #   Data
  # ---------------------------------------------------------------------
  
  # Retourne la "main prop" de la fiche, c'est-à-dire son titre ou son
  # texte (pour les paragraphes)
  def main_value
    data[paragraph? ? 'texte' : 'titre']
  end
  
  # Retourne le titre
  # 
  # Notes
  # -----
  #   * La méthode renverra NIL si c'est un paragraphe (ou que le titre n'existe pas)
  #   * Si on veut une valeur plus sûr (quel que soit le type de fiche), on peut
  #     utiliser plutôt `main_value` ci-dessus.
  def titre
    @titre ||= data['titre']
  end
  
  # Return l'id:type de la fiche (pour les listes)
  def idtype
    @idtype ||= "#{id}:#{type}"
  end
  
  # Return le ptype de la fiche (only paragraph)
  # 
  def ptype
    @ptype ||= data['ptype']
  end
  
  # Retourne l'instance {Fiche} du parent (si la fiche a un parent)
  def parent
    return nil if data['parent'].nil?
    Fiche::get(data['parent']['id'], data['parent']['type'])
  end
  
  # Retourne l'instance {Fiche} du livre de la fiche si elle est dans un livre
  # 
  def book
    @book ||= get_book
  end
  
  # Pour un paragraphe de ptype différent de 'text', retourne
  # son vrai texte (celui qui sera affiché).
  # 
  # Notes
  #   * Le fichier peut être défini soit par son path absolu ou relatif depuis
  #     la racine de l'application, soit par son path relatif dans le dossier
  #     ressource des textes.
  # 
  def real_text
    @real_text ||= begin
      file_path = "#{main_value}"
      file_path = File.join(Collection::folder_ressource_textes, file_path) unless File.exists? file_path
      if File.exists? file_path
        PFile.new(file_path).to_html
      else
        "[#Impossible de charger le texte : Fichier introuvable: #{file_path}]"
      end
    end
  end
  
  # ---------------------------------------------------------------------
  #   Status
  # ---------------------------------------------------------------------
  
  def exists?
    return File.exists? path
  end

  # Return TRUE si la fiche est visible dans le fichier de
  # configuration courante.
  # 
  # @note : si le fichier de configuration courante n'existe pas, seuls les
  # livres sont marqués on_table
  # 
  def visible?;     @is_visible ||= false                 end
  def invisible?;   @is_invisible ||= false == visible?   end
  
  # L'ouverture de la fiche n'est plus enregistrée dans ses données,
  # mais dans le fichier de configuration courante.
  # 
  # Avant de pouvoir utiliser cette propriété, il est INDISPENSABLE de faire
  # appel à : Collection::current_configuration
  # 
  def opened?
    @is_opened == true
  end
  # Return TRUE si la fiche n'est pas ouverte
  # Même note que ci-dessus : pour faire usage de cete propriété, il est INDISPENSABLE
  # d'avoir fait appel à Collection::current_configuration (qui est la seule à 
  # connaître l'état d'ouverture/fermeture des fiches).
  # 
  def closed?; false == opened? end
  
  def book?;      @type == 'book' end
  def chapter?;   @type == 'chap' end
  def page?;      @type == 'page' end
  def paragraph?; @type == 'para' end
  
  # Return TRUE si la fiche est une fiche à détruire
  def deleted?
    @is_deleted ||= (data['deleted'] == true)
  end
  def orpheline?
    @is_orpheline ||= !hasParent?
  end
  def hasParent?
    false == data['parent'].nil?
  end
  def hasChildren?
    false == ( data['enfants'].nil? || data['enfants'] == [] )
  end
  
  def printed?
    data['not_printed'] != true
  end
  
  # Return toutes les données des enfants de la fiche.
  # La méthode est récursive : si un enfant est ouvert, on charge aussi ses
  # enfants.
  def data_children
    @data_children ||= begin
      data_children = []
      children.each do |minidata|
        child = Fiche.new(minidata['id'], minidata['type'])
        data_children << child.data
        data_children += child.data_children if child.opened? || child.chapter?
      end if hasChildren?
      data_children
    end
  end
  
  # Retourne les données (pour remontée ajax)
  # 
  # @note   Attention, c'est toujours un Array qui est retourné, pas un hash des
  #         données. Il faut donc utiliser `liste_data += <ifiche>.get_data'
  #
  # @param  options
  #         :children   => true / :if_opened
  #           Retourne aussi les données des enfants (true) dans tous les cas,
  #           (:if_opened) seulement si la fiche est ouverte ou si c'est un chapitre
  # 
  def get_data options = nil
    options ||= {}
    d = [data]
    d += data_children if chapter? || options[:children] === true || (options[:children]==:if_opened && opened?)
    return d
  end
  
  def get_book
    return nil if parent.nil?
    return parent if chapter?
    return parent.book
  end
  
  
  # Retourne la liste {Array} des enfants comme liste d'instances
  # fiche
  # 
  def children_as_fiches
    return [] unless hasChildren?
    children.collect{|dchild| Fiche::new( dchild['id'], dchild['type'])}
  end
  
  # Retourne la donnée enfants comme liste de {Hash} contenant
  # 'id' et 'type'
  # 
  def children
    @children ||= data['enfants']
  end
  
  # Retourne les données de la fiche, enregistrées dans son fichier Marshal.
  # Notes
  #   * Pour une fiche de type paragraphe, si son ptype n'est pas 'text', il
  #     faut effectuer un traitement pour renseigner la propriété 'real_text'
  # @return {Hash} Les données de la fiche.
  def data
    @data ||= begin
      # Ci-dessous, il faut vraiment définir déjà @data pour que les méthodes
      # paragraph? etc. et le traitement de `real_text' puisse fonctionner.
      @data = Marshal.load( File.read path )
      @data['real_text'] = real_text if paragraph? && ptype != 'text'
      @data
    end
  end
  
  # Renvoie un affixe, calculé d'après le titre, qui permettra
  # de composer un nom de fichier.
  # Notes
  # -----
  #   * Utilisé pour la publication du livre, pour déterminer les
  #     noms des fichiers PDF et PostScript
  # 
  def normalized_affixe_from_titre
    require '../lib/ruby/extension/string'
    @affixe_from_titre ||= titre.normalize.gsub(/ /, '_').gsub(/\\?(['"])/, '')
  end
  
  def path
    @path ||= self.class::path_to(id, type)
  end
end