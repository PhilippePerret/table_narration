class Collection
  class << self
    
    # Données de configuration courante (si le fichier CURRENT_CONFIG.conf
    # existe)
    # 
    # @return {Hash} Table contenant :
    #   {
    #     'openeds':{}
    #   }
    # 
    def current_configuration
      @current_configuration ||= begin
        dconf = {
          :visibles => {},
          :openeds  => {}
        }
        if File.exists? path_current_config
          raw_dconf = JSON.parse(File.read path_current_config)
          raw_dconf['openeds'].each do |fdata|
            dconf[:openeds] = dconf[:openeds].merge( fdata['id'].to_i => {:opened=>true, :type=>fdata['type']})
          end
          raw_dconf['visibles'].each do |fdata|
            dconf[:visibles] = dconf[:visibles].merge( fdata['id'].to_i => {:visible=>true, :type=>fdata['type']})
          end
        end
        dconf
      end
    end
    
    # Return la liste ({Array}) des fiches non rangées
    # Chaque élément est un {String} "<id>:<type>"
    # OBSOLÈTE
    def non_rangeds
      return [] unless File.exists? path_liste_non_ranged
      File.read(path_liste_non_ranged).split("\n").reject{|el| el == ""}
    end
    # Enregistre la nouvelle liste des non rangées
    def save_non_rangeds liste
      File.unlink path_liste_non_ranged if File.exists? path_liste_non_ranged
      liste.uniq!
      if liste.count > 0
        File.open(path_liste_non_ranged, 'wb'){|f| f.write liste.join("\n") }
      end
    end
    
    # Retourne le path au fichier contenant la configuration actuelle
    #
    def path_current_config
      @path_current_config ||= File.join(folder, 'CURRENT_CONFIG.conf')
    end
    
    # OBSOLÈTE
    def path_liste_non_ranged
      @path_liste_non_ranged ||= File.join(folder_listes, 'non_ranged')
    end

    def folder_listes
      @folder_listes ||= begin
        d = File.join(folder, 'liste')
        Dir.mkdir(d, 0755) unless File.exists?(d)
        d
      end
    end
    def folder_backups
      @folder_backups ||= begin
        dos = File.join('.', 'collection', 'backup')
        Dir.mkdir(dos, 0755) unless File.exists?(dos)
        dos
      end
    end

    def folder
      @folder ||= File.join('.', 'collection', mode_test? ? 'test' : 'current')
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