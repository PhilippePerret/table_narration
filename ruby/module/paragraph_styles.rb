=begin

module StylesParagraph

Actualise les styles de paragraphe
----------------------------------

PRODUIT
-------

  * Le fichier ./css/livre/styles_paragraph.css des classes CSS
  * Le fichier ./js/data/style_paragraph.js qui définit la liste PARAGRAPH_STYLES
    avec le nom des styles et leur caractéristique.
    
REQUIS
------

  * Le fichier ./data/asset/styles_paragraph.txt qui contient la définition des
    styles CSS (en pseudo YAML)
    
=end

module StylesParagraph

  module OwnMethods
    FORCE_UPDATE = false
    
    # Les données des styles relevés
    # ------------------------------
    # En clé : le nom du style ('mon_style' est différent de 'mon_style:hover')
    # En valeur : la définition du style.
    STYLES = {}
    
    # Liste des styles
    # ----------------
    # {Array} de tous les noms de styles ('mon_style' est identique à 'mon_style:hover'
    # et ne produit donc que l'entrée 'mon_style')
    STYLE_NAMES = []
    
    # Listes des selecteurs courants
    # ------------------------------
    # C'est à la liste de ces sélecteurs qui seront ajoutés les
    # propriétés
    @current_selectors = []
    
    # Method to call from outside
    # 
    def update_styles_paragraph_if_needed
      update_styles_paragraph if need_update?
    end
    
    # - Main -
    # 
    def update_styles_paragraph
      load_and_analyse
      product_css_file
      product_js_file
    end

    # - Charge et analyse le fichier de donnée
    def load_and_analyse
      File.read(file_data_path).each_line do |line|
        next if line.strip == "" || line.start_with?('#')
        if line.start_with? ' '
          # => Propriété
          analyse_as_property line
        else
          # => Nom de style
          analyse_as_selector line
        end
      end
    end
    
    # --- Produit le fichier CSS ---
    # 
    def product_css_file
      File.unlink file_css_path if File.exists? file_css_path
      code = css_code
      File.open(file_css_path, 'wb'){|f| f.write css_header + code }
    end
    
    # Produit le code CSS à écrire
    # 
    def css_code
      STYLES.collect do |selector, dselector|
        "fiche.para textarea.#{selector}{border:0;}\n"+
        "fiche.para div.#{selector},"+
        "fiche.para textarea.#{selector},"+
        "div#div_paragraph_styles li.#{selector} {\n" +
        dselector.collect{ |prop, val| "\t#{prop} : #{val} !important;"}.join("\n") +
        "\n}\n"
      end.join("\n")
    end

    # --- Produit le fichier JS ---
    # 
    def product_js_file
      File.unlink file_js_path if File.exists? file_js_path
      File.open(file_js_path, 'wb') do |f|
        f.write js_header + 'PARAGRAPH_STYLES = ["'+STYLE_NAMES.join('", "')+'"];'
      end
    end
    
    
    def analyse_as_selector line
      @current_selectors = []
      dline = line.strip.split(',').collect{|el| el.strip}
      dline.each do |selector|
        style_name, after_colon = selector.split(':')
        @current_selectors  << selector
        if STYLES[selector].nil?
          STYLE_NAMES      << style_name
          STYLES[selector] = {} 
        end
      end
    end
    # Analyse la ligne comme une définition de propriété
    def analyse_as_property line
      dline = line.strip.gsub(/( |\t)( |\t)+/, ' ').split(' ')
      property = dline.shift
      value    = dline.join(' ')
      add_to_current_selectors property, value
    end
    
    # Ajoute la propriété +property+ à la liste des sélecteurs courants
    # 
    def add_to_current_selectors property, value
      @current_selectors.each do |selector|
        STYLES[selector] = STYLES[selector].merge(property => value)
      end
    end

    # Return TRUE si les fichiers doivent être actualisés
    # 
    # Ils sont à actualiser quand :
    #   - Le fichier des données (.txt) est plus jeune que le fichier CSS
    #   - Ce module est plus jeune que le plus vieux des fichier (.txt, .css, .js)
    #     (c'est-à-dire lorsqu'on a modifié ce programme)
    def need_update?
      return true if FORCE_UPDATE
      return true unless File.exists?(file_css_path) && File.exists?(file_js_path)
      oldest = [file_data_mtime, file_css_mtime, file_js_mtime].max
      return (file_data_mtime > file_css_mtime) || (file_module_mtime > oldest)
    end

    def file_data_path
      @file_data_path ||= File.join('.', 'data', 'asset', 'paragraph_styles.txt')
    end
    def file_css_path
      @file_css_path ||= File.join('.', 'css', 'livre', 'paragraph_styles.css')
    end
    def file_js_path
      @file_js_path ||= File.join('.', 'js', 'data', 'paragraph_styles.js')
    end
    def file_module_path
      @file_module_path ||= File.join('.', 'ruby', 'module', 'paragraph_styles.rb')
    end
    def file_data_mtime
      @file_data_mtime ||= (file_mtime_or_zero file_data_path)
    end
    def file_css_mtime
      @file_css_mtime ||= (file_mtime_or_zero file_css_path)
    end
    def file_js_mtime
      @file_js_mtime ||= (file_mtime_or_zero file_js_path)
    end
    # Return la date de dernière modification du fichier de chemin +path+
    # ou 0 si le fichier n'existe pas.
    def file_mtime_or_zero path
      if File.exists? path then File.stat(path).mtime else 0 end
    end
    # Ce module
    def file_module_mtime
      @file_module_mtime ||= File.stat(file_module_path).mtime
    end

    # Retourne l'entête CSS à appliquer
    def css_header
      <<-ofc
/*
 *  Paragraph Styles
 *  ----------------
 *
 *  @last_update : #{now_human}
 */
#{warning}
      ofc
    end
    # Retourne l'entête JS à appliquer
    def js_header
      <<-ofc
/*
 *  Paragraph Style List
 *  --------------------
 *  @last_update : #{now_human}
 */
#{warning}
      ofc
    end
    
    # Retourne le warning ne pas modifier
    def warning
      <<-eoc
/*        ------------------------------------------------
 *        | = = = = NE PAS MODIFIER CE FICHIER = = = = = |
 *        | MODIFIER : ./data/asset/paragraph_styles.txt |
 *        | PUIS RECHARGER L'APPLICATION (AUTO UPDATE)   |
 *        ------------------------------------------------
 */
 
 
      eoc
    end
    # Retourne la date de maintenant dans un format humain
    def now_human
      Time.now.strftime("%d %m %Y - %H:%M (day month year - hours:minutes)")
    end
  end
  extend OwnMethods
end