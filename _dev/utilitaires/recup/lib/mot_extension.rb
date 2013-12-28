=begin

Class Mot
---------
Extension de la class interdata Mot

=end
require '../lib/ruby/extension/string' # Pour normalize

class Mot
  
  class << self
    
    # Table de correspondance entre les anciens mots et les nouveaux
    # 
    attr_reader :OLD_ID_TO_NEW_ID
    
    def error err
      OPage::error err
    end
    
    # Construction d'une table de correspondance entre les anciens IDs (par nombre)
    # et les nouveaux
    # 
    # Les anciennes définitions ressemblent à "MOT[<id>|mot utilisé dans le texte]"
    # Les nouvelles définitions ressemblent à "[mots:<id>|mot utilisé|options]"
    # 
    # Les données sont enregistrées dans un fichier oldid_to_newid.js dans le
    # dossier de l'ancien scénodico (xarchive) mais seulement si aucune erreur n'a
    # été rencontrée. Ce fichier est lu plutôt que de tout recommencer chaque fois.
    # 
    # La méthode produit @OLD_ID_TO_NEW_ID, un {Hash} avec en clé l'ancien identifiant
    # nombre et en valeur le nouvel identifiant string
    def tables_correspondance_old_new
      raise "L'ancien Scénodico devrait se trouver dans #{folder_old_scenodico}" unless File.exists? folder_old_scenodico
      if File.exists? path_oldid_to_newid
        @OLD_ID_TO_NEW_ID = JSON.parse(File.read(path_oldid_to_newid).force_encoding('UTF-8'))
        return
      end
      code_data_js = File.read(File.join(folder_old_scenodico, 'data.js')).force_encoding('UTF-8')
      code_data_js = code_data_js[code_data_js.index('{')..-2]
      code_data_js.gsub!(/([0-9]{1,3}):/, '"\1":')
      old_data = JSON.parse(code_data_js)
      
      
      # = débug : pour pouvoir la liste des mots dans leur nouvelle version = 
      # Mot::data_json.each{|k,v| puts "#{k}:#{v}"}
      
      @OLD_ID_TO_NEW_ID = {}
      error_reached = []
      old_data.each do |mid, mot|
        # puts "-> #{mot}"
        new_id = case mid.to_s
          # Quelques cas spéciaux traités à part
          when "272" then 'EspaceDI'
          when "191" then 'NoudDra'
          when "193" then 'Noud'
          when '231' then 'Paradig'
          else search_new_id_of( {:mot => mot} )
        end
        unless new_id.nil?
          @OLD_ID_TO_NEW_ID = @OLD_ID_TO_NEW_ID.merge mid => new_id
        else
          puts "# Impossible de trouver le nouvel identifiant de : #{mid}:#{mot}"
          error_reached << "#{mid}:#{mot}"
        end
      end
      if error_reached.count == 0
        # On enregistre un fichier pour ne pas avoir à le faire sans cesse
        File.open(path_oldid_to_newid, 'wb'){|f| f.write @OLD_ID_TO_NEW_ID.to_json}
      end
    end
    
    # Path du fichier contenant la table de correspondance entre les anciens
    # identifiant et les nouveaux
    def path_oldid_to_newid
      @path_oldid_to_newid ||= File.join(folder_old_scenodico, 'oldid_to_newid.js')
    end
    # Path des données anciennes du scénodico
    def folder_old_scenodico
      @folder_old_scenodico ||= File.join('..', 'xarchive', 'scenodico-old')
    end
    
    
    # Contrairement aux films, les identifiants des mots ne sont plus
    # les mêmes. Le nombre de l'ancienne version a été remplacé par une
    # portion du mot (réduite à 6 caractères ou plus si doublon)
    # Il faut donc récupérer l'identifiant nouveau du mot +mot+
    # 
    # @param  {Hash} dmot Les données du mot telles que récupérées dans la balise
    # 
    # @return {String} L'identifiant du mot ou NIL si le mot n'a pas été trouvé
    def new_id_of_old_mot dmot
      if @OLD_ID_TO_NEW_ID[dmot[:id].to_s].nil?
        nil
      else
        @OLD_ID_TO_NEW_ID[dmot[:id].to_s]
      end
    end
    
    # Cherche le nouvel identifiant pour le mot dont les données sont
    # fournies en argument
    def search_new_id_of dmot
      idmot = dmot[:mot].
                normalize.
                gsub(/[’\-]/,' ').gsub(/[\(\)']/, "").
                split.collect{|el| el.capitalize}.reject{|el| el==""}.join('')
      idmot_fin = idmot[0..6]
      fin = false
      id_found = nil
      ids_tested = []
      mot_tested = (dmot[:mot]||"").downcase
      begin
        ids_tested << idmot_fin
        if get_mot(idmot_fin) != nil
          # Le mot a été trouvé. Il faut vérifier que ce soit bien le
          # mot cherché en vérifiant le mot véritable
          # On part du principe que c'est le bon mot
          id_found = idmot_fin
          mot_found = get_mot(idmot_fin)['mot'].downcase
          if [mot_found, "#{mot_found}s", "#{mot_found}x"].index(mot_tested) != nil
            break # OK
          else
            # PAS OK
            id_found = nil
          end
        end
        # Pour poursuivre et essayer avec un autre identifiant si possible
        if idmot_fin.length < idmot.length
          idmot_fin = idmot[0..idmot_fin.length]
        else
          fin = true
        end
      end while fin == false
      # En sortant de la boucle
      if id_found.nil?
        error "Impossible de trouver le mot pour la balise MOT[#{dmot[:id]}|#{dmot[:mot]}] (cherché avec les identifiants #{ids_tested.join(', ')})"
      end
      id_found
    end
    
    # Retourne la donnée du mot d'identifiant (nouveau) +id+
    # Prépare la liste des mots pour obtenir une table qui
    # définit l'id (nouveau) du mot par rapport à son id ancien (un nombre)
    # 
    def get_mot id
      @MOTS ||= begin
        @MOTS = Mot::data_json
        # puts @MOTS.inspect # Pour visualiser la liste de mots
        @MOTS
      end
      @MOTS[id]
    end
    
  end
end