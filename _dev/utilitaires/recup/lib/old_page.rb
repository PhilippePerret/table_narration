=begin

Class OPage
-----------
Pour récupérer les textes des anciennes pages de cours

=end

class OPage # Classe pour une vieille page
  class << self
    
    # {Array} des erreurs rencontrées au cours du traitement du vieux texte
    attr_reader :errors
    
    # Gestion des erreurs
    def error err
      @errors ||= []
      @errors << err 
    end
    
    # Retourne le path à la page préformatée d'identifiant pid
    def formated_page pid
      File.join(folder_preformated, "f#{pid}.txt")
    end
    
    def folder_preformated
      @folder_preformated ||= begin
        d = File.join(folder_livre, 'page', 'preformat_collection')
        Dir.mkdir d unless File.exists? d
        d
      end
    end
    def folder_data
      @folder_data ||= File.join(folder_livre, 'page', 'data')
    end
    def folder_textes
      @folder_textes ||= File.join(folder_livre, 'page', 'texte')
    end
    def folder_livre
      @folder_livre ||= File.join('..', 'xarchive', 'livre_en_ligne')
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  
  # {Number} Identifiant de la page
  # 
  attr_reader :id
  
  def initialize id
    @id = id
  end
  
  # Raccourci pour la méthode de classe
  # 
  def error err
    self.class.error err
  end
  
  # Retourne true si la page a déjà été formatée et que l'originale
  # n'a pas été modifiée depuis sont formatage
  def formated?
    return false unless File.exists? path_formated
    return File.stat(path_texte).mtime < File.stat(path_formated).mtime
  end
  
  # Retourne le code HTML de la page
  # 
  def code
    @code ||= File.read(path_texte)
  end
  
  # Retourne les informations du fichier data
  def infos
    @infos ||= JSON.parse(File.read(path_data).force_encoding('UTF-8'))
  end
  alias :data :infos
  
  # Retourne le texte avec les premières corrections effectués,
  # pour obtenir un texte pré-formaté.
  # @note   C'est un code valide pour table_narration, enregistré dans le
  #         fichier xarchive/livre_en_ligne/page/formated_collection/<id>.txt,
  #         qui doit juste être sectionné en paragraphes.
  def texte
    @texte ||= parse
  end
  
  # = main =
  # Méthode principale qui prend le code original et le formate pour table_narration
  # en l'enregistrant dans le fichier `path_formated`
  # @return {String} Le code formaté
  def parse_and_save
    parse
    save
    @code
  end
  
  # Enregistre le code préformaté dans le dossier 'formated_collection' en
  # archive
  def save
    File.open(path_formated, 'wb'){|f| f.write @code }
  end
  
  
  # Parse le @code pour obtenir un texte pré-formaté
  # Transformations opérés
  #   * Ligne de titre ==...== titre::
  #   * balise <note>...</note> => note::...
  #   * balise <personnage>...</personnage> (realisateur, auteur, etc.)
  #     -> [personnage:...]
  # 
  def parse
    code # juste pour définir @code
    parse_code_php
    corrections_caracteres
    parse_titres
    parse_balises_people
    parse_balises_speciales
    parse_balises_mots
    parse_balises_films
    last_corrections
    check_code_final
    finalise_code_with_infos
    @code
  end
  
  # Finalisation complète du code, notamment en ajoutant les
  # information du fichier data
  # 
  def finalise_code_with_infos
    created_at = infos['lm'].to_i
    @code = @code.strip
    @code = "titre_page::#{infos['t']}\n"+
            "resume_page::#{infos['r']}\n"+
            "created_at:#{created_at}\n"+
            "old_dev::#{infos['n']}\n"+
            (php? ? "CONTENTS_PHP::true\n" : "")+
            (only_javascript? ? "ONLY_JS::true\n" : "")+
            @code
  end
  # Quelques corrections à la volée au début du traitement
  # 
  def corrections_caracteres
    @code.gsub!(/\^rc\^/, "\n")
    @code.gsub!(/“ /, '“')
    @code.gsub!(/ ”/, '”')
  end
  
  # Quelques corrections à la volée à la fin du traitement
  # Corrections
  # -----------
  #   * Suppression de tous les doubles chariots en simple chariot
  #     (en tenant compte des [[blank]] éventuels)
  def last_corrections
    @code.gsub!(/\n(?:([[:blank:]]| |&nbsp;)*)$/, "\n")
    @code.gsub!(/\n+/, "\n")
  end
  
  # On regarde si des choses n'ont pas été traitées
  # => Renvoyées en console d'erreur à la fin du traitement
  def check_code_final
    if @code.index('MOT[')
      error "Des balises MOT[...] n'ont pas été traitées. Elles ont été mises en exergue à la ligne."
      @code.gsub!(/MOT/, "\n### MOT ###\n") 
    end
    if @code.index('FILM[')
      error "Des balises FILM[...] n'ont pas pu être traitées. Elles ont été mises en exergue à la ligne"
    end
  end
  
  def parse_balises_films
    @code.gsub!(/FILM\[([^\|]*?)(?:\|(.*?))?\]/u){
      tout   = $&
      old_id = $1
      titre  = $2
      if (dfilm = Film::get_film(old_id)).nil?
        error "Film introuvable : #{tout}"
        "\n####{tout}###\n"
      else
        "[film:#{old_id}|#{dfilm['titre']}]"
      end
    }
  end
  def parse_balises_mots
    @code.gsub!(/MOT\[([0-9]+)\|(.*?)\]/u){
      tout   = $&
      old_id = $1
      mot    = $2
      new_id = Mot::new_id_of_old_mot( :id => old_id.to_i, :mot => mot)
      if new_id.nil?
        "####{tout}###"
      else
        "[mot:#{new_id}|#{mot}]"
      end
    }
  end
  # Retourne true si le texte contient du code PHP
  # 
  def php?
    @code.index('php::') != nil
  end
  
  # Retourne true si le texte est un code javascript
  # 
  def only_javascript?
    @code.start_with?('<!--/*') && @code.end_with?('*/-->')
  end
  
  def parse_code_php
    @code.gsub!(/<\?(?:php|PHP)(.*?)\?\>/){
      codephp = $1
      'php::' + 
      codephp.
        gsub(/\^rc\^/, '--rcincode--').
        gsub(/\n/, '--rcincode--')
    }
    
  end
  
  # Parse les titres (définis par des signes "=")
  # 
  def parse_titres
    @code.gsub!(/^(={1,3})(.*?)\1$/u){
      titre = $2
      level = $1.length
      "titre::#{level}::#{titre}"
    }
  end
  
  # Parse les balises spéciales de types <note>, <onlywebmaster>
  # 
  def parse_balises_speciales
    @code.gsub!(/<(note|onlywebmaster)>(.*?)<\/\1>/um){
      bal = $1
      txt = $2
      bal = "not_printed" if bal == "onlywebmaster"
      # Le texte peut être sur plusieurs lignes, il faut traiter chaque ligne
      "#{bal}::"+txt.split("\n").reject{|l|l.strip == ""}.join("\n#{bal}::")
      # "#{bal}::#{txt}"
    }
  end
  # Parse les balises de type <personnage>...</personnage>
  # 
  def parse_balises_people
    @code.gsub!(/<(personnage|realisateur|auteur|producteur|acteur)>(.*?)<\/\1>/u, "[\\1:\\2]")
  end
    
  # Chemin d'accès au fichier contenant le code pré-formarté pour la collection.
  # En fait, ce fichier contient un code valide pour le nouveau format 
  # (table_narration) pas il doit être sectionné en paragraphe pour pouvoir entrer
  # dans la collection
  def path_formated
    @path_formated ||= File.join(self.class.folder_preformated, "f#{id}.txt")
  end
  def path_data
    @path_data ||= File.join(self.class.folder_data, "f#{id}.js")
  end
  def path_texte
    @path_texte ||= File.join(self.class.folder_textes, "f#{id}.htm")
  end
end
