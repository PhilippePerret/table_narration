class Collection
  class << self
    
    # Données de configuration courante (si le fichier CURRENT_CONFIG.conf
    # existe)
    # 
    # @return {Hash} Table contenant :
    #   {
    #     'visibles':[] # {Array} des :id, :type des fiches visibles
    #     'openeds':{}
    #   }
    # 
    def current_configuration
      @current_configuration ||= begin
        fiches_visibles = get_visibles # {Array} d'instances {Fiche}
        if raw_current_config
          raw_current_config['openeds'].each do |dfiche|
            Fiche::get(dfiche['id'].to_i).is_opened = true
            log "Fiche #{dfiche['id']} marquée ouverte"
          end
        end
        log "Fiches visibles à la fin de Collection::current_configuration :"
        log fiches_visibles.inspect
        log "États d'ouverture :"+
          "\n-------------------"
        fiches_visibles.each do |fiche|
          log "\tFiche ##{fiche.id} : " + (fiche.opened? ? "OPENED" : "CLOSED")
        end
        {
          :visibles => fiches_visibles, 
        }
      end
    end
    
    # Retourne les fiches visibles
    # 
    # La méthode utilise le fichier de configuration courante où sont consignées
    # les fiches courantes, ou prend tous les livres.
    # 
    # @return un {Array} d'instances {Fiche}
    # 
    def get_visibles
      if raw_current_config
        log "[Collection::get_visibles] Fichier configuration existant"
        raw_current_config['visibles'].collect do |dfiche|
          Fiche.new dfiche['id'], dfiche['type']
        end
      else
        log "[Collection::get_visibles] Fichier configuration INEXISTANT"
        # Si le fichier de configuration n'existe pas, les fiches visibles
        # sont seulement les livres.
        Dir["#{Collection::folder_fiches}/book/*.msh"].collect do |path|
          get_fiche_with_path path
        end
      end
    end
    
    # Retourne les données de configuration courante ou null si
    # le fichier CURRENT_CONFIG.conf n'existe pas
    # 
    def raw_current_config
      @raw_current_config ||= begin
        if File.exists? path_current_config
          JSON.parse(File.read path_current_config)
        else
          nil
        end
      end
    end
    
    # Retourne l'instance {Fiche} de la fiche de path +path+
    # 
    def get_fiche_with_path path
      dfiche = Marshal.load(File.read path)
      Fiche.new dfiche['id'], dfiche['type']
    end
    
    # Retourne le path au fichier contenant la configuration actuelle
    #
    def path_current_config
      @path_current_config ||= File.join(folder, 'CURRENT_CONFIG.conf')
    end
    
    def folder_fiches
      @folder_fiches ||= (getfolder File.join(folder, 'fiche'))
    end
    def folder_listes
      @folder_listes ||= (getfolder File.join(folder, 'liste'))
    end
    def folder_backups
      @folder_backups ||= (getfolder File.join('.', 'collection', 'backup'))
    end

    def folder
      @folder ||= File.join('.', 'collection', mode_test? ? 'test' : 'current')
    end
    
    def getfolder path
      Dir.mkdir(path, 0777) unless File.exists? path
      path
    end
    
    # Return TRUE si on est en mode test
    def mode_test?
      @mode_test ||= File.exists?('./.mode_test')
    end
    
    def reset_values
      @folder = nil
      @folder_listes = nil
      @mode_test = nil
      Fiche::folder = nil
    end
    # Pour basculer vers le mode test.
    # La méthode met en dossier de collection courant le dossier de la collection
    # test
    def bascule_vers_mode_test
      reset_values
      File.open('./.mode_test', 'wb'){|f| f.write("Application en mode test")}
    end
    def bascule_vers_mode_normal
      reset_values
      File.unlink('./.mode_test')
    end
  end
end