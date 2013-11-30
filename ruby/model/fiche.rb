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
    def path_to data_fiche
      File.join(folder, data_fiche['type'], data_fiche['id'] + ".js")
    end
    
    # Return le path du dossier principal des fiches
    def folder
      @folder ||= File.join(Collection::folder, 'fiche')
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  
end