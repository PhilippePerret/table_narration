class Fiche
  
  # ---------------------------------------------------------------------
  #   Classe
  # ---------------------------------------------------------------------
  class << self
    
    # Dossier principal des fiches
    # 
    attr_accessor :folder
    
    # Récupère l'instance de la fiche d'identifiant +id+
    # 
    def get id
      @list ||= {}
      @list[id.to_i]
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
  
  # Return l'id:type de la fiche (pour les listes)
  def idtype
    @idtype ||= "#{id}:#{type}"
  end
  
  def exists?
    return File.exists? path
  end

  # Return TRUE si la fiche est visible dans le fichier de
  # configuration courante.
  # 
  # @note : si le fichier de configuration courante n'existe pas, seuls les
  # livres sont marqués on_table
  # 
  def visible?
    @is_visible ||= false
  end
  
  def invisible?
    @is_invisible ||= false == visible?
  end
  
  # Retourne l'instance {Fiche} du parent s'il est défini
  def parent
    return null if data['parent'].nil?
    Fiche::get(data['parent']["id"])
  end
  # L'ouverture de la fiche n'est plus enregistrée dans ses données,
  # mais dans le fichier de configuration courante.
  # 
  # Avant de pouvoir utiliser cette propriété, il est INDISPENSABLE de faire
  # appel à : Collection::current_configuration
  # 
  def opened?
    @is_opened == true
  end
  
  def closed?; false == opened? end
  
  def book?;      @type == 'book' end
  def chapter?;   @type == 'chap' end
  def page?;      @type == 'page' end
  def paragraph?; @type == 'para' end
  
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
    data['printed'] != false
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
  
  def children
    @children ||= data['enfants']
  end
  
  def data
    @data ||= Marshal.load( File.read path )
  end
  
  def path
    @path ||= self.class::path_to(id, type)
  end
end