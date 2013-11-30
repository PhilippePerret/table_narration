class Fiche
  
  # ---------------------------------------------------------------------
  #   Classe
  # ---------------------------------------------------------------------
  class << self
    
    # Dossier principal des fiches
    # 
    attr_accessor :folder
    
    # Return le path du fichier de la fiche de donnée +data_fiche+
    # +data_fiche+ doit contenir au minimum : 
    #   :id::     Son identifiant
    #   :type::   Son type (para, book, etc.)
    # OU data_fiche est l'identifiant et type le type
    def path_to data_fiche, type = nil
      id, type = 
      if type.nil? then [data_fiche['id'], data_fiche['type']]
      else [data_fiche, type] end
        
      File.join(folder, type, id + ".js")
    end
    
    # Return le path du dossier principal des fiches
    def folder
      @folder ||= File.join(Collection::folder, 'fiche')
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  attr_reader :id
  attr_reader :type
  
  def initialize id, type
    @id   = id
    @type = type
  end
  
  def exists?
    return File.exists? path
  end
  
  def ranged?; data['ranged'] == "true"  end
  def opened?; data['opened'] == "true"  end
  def closed?; data['opened'] == "false" end
  
  def book?;      @type == 'book' end
  def chapter?;   @type == 'chap' end
  def page?;      @type == 'page' end
  def paragraph?; @type == 'para' end
  
  def hasChildren?
    false == ( data['enfants'].nil? || data['enfants'] == [] )
  end
  
  def children
    @children ||= data['enfants']
  end
  
  def data
    @data ||= JSON.parse(File.read path)
  end
  
  def path
    @path ||= self.class::path_to(id, type)
  end
end