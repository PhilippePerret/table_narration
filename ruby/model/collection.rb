class Collection
  class << self
    
    # Return la liste ({Array}) des fiches non rangées
    # Chaque élément est un {String} "<id>:<type>"
    def non_rangeds
      return [] unless File.exists? path_liste_non_ranged
      File.read(path_liste_non_ranged).split("\n").reject{|el| el == ""}
    end
    # Enregistre la nouvelle liste des non rangées
    def save_non_rangeds liste
      File.unlink path_liste_non_ranged if File.exists? path_liste_non_ranged
      liste.uniq!
      if liste.length > 0
        File.open(path_liste_non_ranged, 'wb'){|f| f.write liste.join("\n") }
      end
    end
    
    def folder
      @folder ||= File.join('.', 'collection', mode_test? ? 'test' : 'current')
    end
    def path_liste_non_ranged
      @path_liste_non_ranged ||= File.join(folder_listes, 'non_ranged')
    end
    def folder_listes
      @folder_listes ||= File.join(folder, 'liste')
    end
    def folder_backups
      @folder_backups ||= begin
        dos = File.join('.', 'collection', 'backup')
        Dir.mkdir(dos, 0755) unless File.exists?(dos)
        dos
      end
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