=begin

Class NPage
-----------
Extension de la classe qui permet de créer la collection Scenariopole à 
partir des anciens cours

=end

# Charger les classes Collection et Fiche
Dir["./ruby/model/*.rb"].each do |m| require m end
require './data/secret/data_phil' # => DATA_PHIL

# Path du fichier ajax
FOLDER_AJAX = File.expand_path(File.join('.', 'ruby', 'ajax'))

class NPage
  class << self
    
    # Dernier Identifiant fiche utilisé
    # 
    attr_reader :last_id
    
    # La liste de tous les titres de pages
    # 
    attr_reader :titres_pages
    
    # Les données par Livres
    # ------------------------
    # C'est un Hash contenant en clé l'identifiant du chapitre (nombre)
    # et en valeur :
    # {:id => <id chapitre>, :titre => <titre chapitre>, :pages => [<titre pages>]}
    # 
    # Cette donnée est établie à la lecture des titres de pages pour les trier
    # par mots clés (cf. define_chapitres)
    # 
    attr_reader :data_books
    
    # Retourne l'identifiant suivant
    def get_new_id
      @last_id ||= Fiche::last_id
      @last_id += 1
    end
    
    # Méthode principale construisant une fiche
    # Elle permet d'ajouter les données triviales qu'on trouve dans toutes les
    # fiches
    # 
    # @param  {Fiche} fiche  Instance de la fiche à enregistrer
    # @param  {Hash}  data   Ses données à enregistrer
    def create_fiche fiche, data
      data['id']          = data['id'].to_s
      data['class']       = "Fiche"
      data['created_at']  = Time.now.to_i if data['created_at'].nil?
      if data['left'].nil?
        data['left'] = 200 + ((data['id'].to_i * 4) % 1000)
      end
      if data['top'].nil?
        data['top']  = 50 + ((data['id'].to_i * 4) % 600)
      end
      
      if MODE_DEBUG
        puts "\n*** Création fiche:#{data.inspect}"
      else
        fiche.merge data
      end
    end
    
    # == Main ==
    # Construction complète de la collection "Scénariopole"
    # 
    def build_scenariopole
      puts "Construction de la collection ancienne…" if VERBOSE
      classe_pages_par_book
      build_books
    end
    
    # Construction des livres
    # 
    def build_books
      indice_book = 0
      @data_books[:ordre_books].each do |bid|
        book = Fiche.new bid, 'book'
        return if book.exists?
        # Il faut créer ce livre qui n'existe pas
        # ---------------------------------------
        # Il faut lui créer un chapitre unique qui contiendra toutes les pages
        chap = create_chapter_of_book bid
        btitre = @data_books[:books][bid][:titre]
        puts "-> Construction du livre #{btitre}" if VERBOSE
        create_fiche book, {
          'id'          => "#{bid}",
          'left'        => "0",
          'top'         => (indice_book * 40),
          'type'        => "book",
          'titre'       => "#{btitre}",
          'real_titre'  => "#{btitre}",
          'enfants'     => [{'id'=>chap.id.to_s, 'type'=>'chap'}]
        }
        indice_book += 1
        
        # On peut maintenant créer toutes les pages du livre en les insérant
        # dans son chapitre
        create_all_pages_of_book @data_books[:books][bid][:pages], chap
      end
    end
    
    # Crée un nouveau chapitre et retourne son instance
    def create_chapter_of_book bid
      chap = Fiche.new get_new_id, 'chap'
      data = {
        'id'        => chap.id,
        'type'      => "chap",
        'titre'     => "Pages rassemblées",
        'parent'    => {'id' => bid.to_s, 'type' => 'book'},
        'enfants'   => []
      }
      create_fiche chap, data
      chap
    end
    
    # Création de toutes les pages du livre
    # 
    # Notes
    #   * La méthode procède à la fabrication totale des pages
    #   * Elle actualise ensuite la données "enfants" du chapitre
    # 
    # @param  {Array} pages   Liste des pages. C'est un Array d'Objets {:id, :titre}
    #                         où :id correspond NON PAS à l'identifiant dans la
    #                         collection mais à l'identifiant dans scénariopole
    # @param  {Chapter} chap  Instance du chapitre (unique) du livre
    # 
    def create_all_pages_of_book pages, chap
      child_list = []
      pages.each do |dpage|
        ipage = create_page chap.id, dpage
        child_list << {'id' => ipage.id.to_s, 'type' => 'page'}
      end
      if MODE_DEBUG
        puts "*** Enfants du chapitre #{chap.titre} mis à #{child_list.inspect}"
      else
        chap.merge({'enfants' => child_list})
      end
    end
    
    # Création d'une page
    # @param  {Number} cid     Identifiant du chapitre contenant la page
    # @param  {Number} dpage   Data de la page
    # 
    # @return {Fiche} Instance de la page
    def create_page cid, dpage
      page = Fiche.new get_new_id, 'page'
      puts "   -- Page #{dpage[:titre]}" if VERBOSE
      data = {
        'id'      => page.id,
        'type'    => 'page',
        'titre'   => dpage[:titre],
        'parent'  => {'id' => cid.to_s, 'type'=>'chap'},
        'resume'  => nil,
        'dev'     => nil,
        'enfants' => []
      }
      # On crée tous ses paragraphes à l'aide de NPage et renseigne
      # la propriété 'enfants' de la page
      path  = OPage::formated_page dpage[:id]
      npage = NPage.new path, dpage[:id]
      data['enfants']     = npage.create_paragraphs_of page.id
      # On renseigne d'autres propriétés récupérées dans l'entête
      data['created_at']  = npage.data[:created_at]
      data['resume']      = npage.data[:resume]
      data['dev']         = npage.data[:niveau_devel]
      # On crée finalement la page dans la collection
      create_fiche page, data
      page
    end
    
    # On prend toutes les pages et on les classe en chapitres à partir de
    # mots clés
    def classe_pages_par_book
      keywords = {
        'structure'           => 'Structure',
        'exposition'          => "Structure",
        'développement'       => "Structure",
        'dénouement'          => "Structure",
        'acte'                => "Structure",
        'séquence'            => "Structure",
        'incident déclencheur'=> "Structure",
        'pivot'               => "Structure",
        'clé de voûte'        => "Structure",
        'crise'               => "Structure",
        'climax'              => "Structure",
        'rythme'              => "Structure",
        'personnage'          => 'Personnages',
        'dialogue'            => "Personnages",
        'protagoniste'        => "Personnages",
        'antagoniste'         => "Personnages",
        'document'            => "Documents",
        'évènemencier'        => "Documents",
        'Évènemencier'        => "Documents",
        'scénier'             => "Documents",
        'rédaction'           => "Documents",
        'scénario'            => "Documents",
        'brin'                => "Documents",
        'notation'            => "Documents",
        'chemin de fer'       => "Documents",
        'dynamique'           => "Dynamique",
        'objectif'            => "Dynamique",
        'obstacle'            => "Dynamique",
        'conflit'             => "Dynamique",
        'thème'               => "Thématique",
        'propos'              => "Thèmatique",
        'thématique'          => "Thématique",
        'sujet'               => "Thématique",
        'ironie dramatique'   => "Procédés",
        'ironies dramatiques' => "Procédés",
        'recette'             => "Théorie",
        'règle'               => "Théorie",
        'histoire'            => "Théorie",
        'idée'                => "Théorie",
        'fondamentale'        => "Théorie",
        'information'         => "Théorie",
        'principe'            => "Théorie",
        'imagination'         => "Travail auteur",
        'brainstorming'       => "Travail auteur",
        'auteur'              => "Travail auteur",
        'création'            => "Travail auteur",
        'film'                => "Analyse",
        'analyse'             => "Analyse",
        'livre'               => "Utilisation du livre",
        'consultation'        => "Utilisation du livre",
        'table des matières'  => "Utilisation du livre",
        'programme'           => "Utilisation du livre",
        'année'               => "Utilisation du livre",
        'page'                => "Utilisation du livre",
        'chapitre'            => "Utilisation du livre",
        'aide'                => "Utilisation du livre",
        'checkpoint'          => "Utilisation du livre",
        '1 an 1'              => "Utilisation du livre",
        'xxxxxxxxxxxxx'       => "Pages non classées"
      }
      @data_books = {
        :ordre_books  => [],
        :titre2id     => {},
        :books        => {}
      }
      # On prépare déjà la donnée @data_books
      keywords.each do |search, book_titre|
        if @data_books[:titre2id][book_titre].nil?
          book_id = get_new_id
          @data_books[:titre2id][book_titre] = book_id
          @data_books[:ordre_books] << book_id
          @data_books[:books][book_id] = {
            :id     => book_id,
            :titre  => book_titre,
            :pages  => []
          }
        end
      end
      
      # On range les pages dans les books
      # 
      chap_non_classees_id = @data_books[:titre2id]["Pages non classées"]
      page_list.each do |k, titre|
        page_rangee = false
        keywords.each do |search, book_titre|
          if titre.downcase =~ /#{search}/
            book_id = @data_books[:titre2id][book_titre]
            @data_books[:books][book_id][:pages] << {:id => k, :titre => titre}
            page_rangee = true
            break # on passe à la page suivante
          end
        end
        # Si on arrive ici sans que la page ne soit rangée, on la met dans
        # le chapitre "Non classées"
        unless page_rangee
          @data_books[:books][chap_non_classees_id][:pages] << {:id => k, :titre => titre}
        end
      end
    end
    
    # Retourne la liste des pages
    # C'est un {Hash} où la clé est l'identifiant (nombre) et la valeur le
    # titre
    def page_list
      @page_list ||= begin
        h = {}
        Dir["#{OPage::folder_preformated}/*.txt"].each do |path|
          id = File.basename(path, File.extname(path))[1..-1]
          File.open(path) do |f| 
            h = h.merge id => (f.readline).split('::')[1].strip
          end
        end
        h
      end
    end
    
    # Changer le propriété de tous les éléments créés
    # 
    def change_owner owner
      STDOUT.sync = true # ne semble pas fonctionner
      puts "Changement de propriétaire : #{owner}. Merci de patienter..." if VERBOSE
      `echo '#{DATA_PHIL[:password]}' | sudo -S chown -R #{owner} '#{Collection::folder}'`
      puts "\nChangement de propriétaire terminé." if VERBOSE
    end
    
  end
end