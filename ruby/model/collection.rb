require 'json'

class Collection
  class << self
    
    # Nom de la collection courante
    # 
    # Il va déterminer le path de `folder` et donc le path de tous les éléments
    # 
    # @return {String} Le contenu du fichier './.current' ou le nom 'current'
    # par défaut.
    # 
    def name
      @name ||= begin
        if File.exists? path_current
          File.read path_current
        else
          'narration'
        end
      end
    end
    
    # Pour forcer la collection à utiliser
    # 
    def define_name new_name
      @name = new_name
    end
    
    # Retourne la liste de toutes les collections
    # 
    # @return {Array} Liste des noms des collections dans le dossier ./collection
    # 
    def all_names
      Dir["./collection/*"].collect do |path|
        next nil unless (File.directory? path )
        next nil if File.basename(path) == 'backup'
        File.basename(path)
      end.reject{|el| el.nil? }
    end
    # Choisit la collection courante
    # 
    # @param  {String}  name Le nom de la collection à utiliser, correspondant au
    #                   nom de son dossier dans ./collection/
    def choose new_name
      if name != new_name
        reset_values
        File.unlink path_current if File.exists? path_current
        File.open(path_current, 'wb'){|f| f.write new_name}
        @name = new_name
      end
    end
    
    # Opération sur toutes les fiches de la collection
    # 
    def each_fiche
      if block_given?
        all_fiches.each {|fiche| yield fiche }
      else
        raise "Il faut fournir un block de code"
      end
    end
    
    # Récupère toutes les fiches de la collection courante
    # 
    def all_fiches
      @all_fiches ||= begin
        Dir["#{Collection::folder_fiches}/**/*.msh"].collect do |path|
          Fiche::get_fiche_with_path path
        end
      end
    end
    # Données de configuration courante (si le fichier CURRENT_CONFIG.conf
    # existe)
    # 
    # @return {Hash} Table contenant :
    #   {
    #     'on_table':[] # {Array} des :id, :type des fiches on_table
    #     'openeds':{}
    #   }
    # 
    def current_configuration
      @current_configuration ||= begin
        fiches_on_table = get_on_table # {Array} d'instances {Fiche}
        if raw_current_config
          raw_current_config['openeds'].each do |dfiche|
            ifiche = Fiche::get(dfiche['id'].to_i)
            if ifiche.exists?
              ifiche.is_opened = true
            end
            # log "Fiche #{dfiche['id']} marquée ouverte"
          end
        end
        # log "Fiches on_table à la fin de Collection::current_configuration :"
        # log fiches_on_table.inspect
        # log "États d'ouverture :"+
        #   "\n-------------------"
        # fiches_on_table.each do |fiche|
        #   log "\tFiche ##{fiche.id} : " + (fiche.opened? ? "OPENED" : "CLOSED")
        # end
        {
          :on_table => fiches_on_table, 
        }
      end
    end
    
    # Retourne les fiches on_table
    # 
    # La méthode utilise le fichier de configuration courante où sont consignées
    # les fiches courantes, ou prend tous les livres.
    # 
    # @return un {Array} d'instances {Fiche}
    # 
    def get_on_table
      if raw_current_config
        # log "[Collection::get_on_table] Fichier configuration existant"
        raw_current_config['on_table'].collect do |dfiche|
          fiche = Fiche::get dfiche['id']
          fiche = Fiche.new dfiche['id'], dfiche['type'] if fiche.nil?
          if fiche.exists?
            fiche.is_visible = true
            fiche
          else
            nil
          end
        end.reject{|fi| fi.nil?}
      else
        # log "[Collection::get_on_table] Fichier configuration INEXISTANT"
        # Si le fichier de configuration n'existe pas, les fiches visibles
        # sont seulement les livres.
        Dir["#{Collection::folder_fiches}/book/*.msh"].collect do |path|
          fiche = Fiche::get_fiche_with_path path
          fiche.is_visible = true
          fiche
        end
      end
    end
    
    # ---------------------------------------------------------------------
    #   PRÉFÉRENCES
    # ---------------------------------------------------------------------
    
    # Retourne les préférences ou null si le fichier PREFERENCES.msh n'existe pas
    # 
    def preferences
      @preferences ||= begin
        if File.exists? path_preferences
          prefs = Marshal.load(File.read path_preferences)
          prefs.each do |k, v|
            prefs[k] = case v 
            when "false"  then false
            when "true"   then true
            when "null"   then null
            else v
            end
          end
          prefs
        else
          nil
        end
      end
    end
    
    # Enregistre les préférences
    # 
    # @param  preferences   {Hash} contenant les préférences de l'application
    # 
    def save_preferences preferences
      File.unlink path_preferences if File.exists? path_preferences
      File.open(path_preferences, 'wb'){ |f| f.write Marshal.dump(preferences) }
      @preferences = preferences
    end
    
    # Path au fichier préférence
    # 
    # Noter que ce fichier concerne toutes les collections
    # 
    def path_preferences
      @path_preferences ||= File.join('.', 'collection', 'PREFERENCES.msh')
    end
    # ---------------------------------------------------------------------
    #   CONFIGURATION COURANTE
    # ---------------------------------------------------------------------
    
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
    
    # Enregistre la configuration
    # 
    # @param  str   {String} de la configuration (stringifié par JSON) ou table
    #               qui sera jisonifiée.
    # 
    def save_current_configuration str
      str = str.to_json unless str.class == String
      File.open(path_current_config, 'wb'){|f| f.write str}
    end
    
    # Détruit le fichier configuration s'il existe
    # 
    # @note L'opération est appelée à chaque chargement de la collection
    # 
    def kill_current_configuration
     File.unlink path_current_config if File.exists? path_current_config
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
      @folder ||= File.join('.', 'collection', name)
    end
    
    def getfolder path
      Dir.mkdir(path, 0777) unless File.exists? path
      path
    end
    
    # Return TRUE si on est en mode test
    def mode_test?
      @mode_test ||= (name == 'test')
    end
    
    def reset_values
      @folder = nil
      @folder_listes = nil
      @mode_test = nil
      Fiche::folder = nil
    end

    
    # Path au fichier contenant le nom de la collection courante
    # 
    def path_current
      @path_current ||= File.join('.', '.current')
    end
    
  end # /self
end # /Collection