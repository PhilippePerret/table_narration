=begin

Extension de la class Film pour la publication

=end
require '../interdata/film/ruby/model/film'
class Film
  
  FILMS = {}
  
  # ---------------------------------------------------------------------
  #   Class
  # ---------------------------------------------------------------------
  class << self
  
    # Ajoute un film à {Hash} FILMS
    def add ifilm
      return unless FILMS[ifilm.id].nil?
      FILMS[ifilm.id] = ifilm
    end
    
    # Construction du fichier bibliographique
    # 
    # Notes
    # -----
    #   * La méthode est appelée à la fin du traitement de builder.rb
    # 
    def build_biblio
      bpath = RLatex::path_biblio
      File.unlink bpath if File.exists? bpath
      @ref = File.open(bpath, 'a')
      begin_bibliography
      begin
        FILMS.each do |fid, ifilm|
          @ref.write ifilm.to_biblio
        end
      rescue Exception => e
        puts "### ERREUR : #{e.message}\n#{e.backtrace.inspect}"
      end
      end_bibliography
      @ref.close
    end
    def begin_bibliography
      @ref.write "\\begin{thebibliography}{#{FILMS.count}}\n"
    end
    def end_bibliography 
      @ref.write "\\end{thebibliography}"
    end
  end
  
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  
  # Construit et retourne le code pour le texte LaTex, en mémorisant le
  # film si ça n'est pas déjà fait.
  # 
  # Notes
  # -----
  #   * Ne corrige pas les caractères spéciaux, etc., ce qui sera fait plus tard
  #     par la méthode appelante.
  # 
  # @param  {Array} options   Liste des options pour l'affichage.
  #                           NOTE : en première valeur, le titre (inutilisé ici)
  #                           Ensuite, contient quelque chose comme [annee, original]
  #                           pour déterminer les choses à faire apparaitre.
  # 
  def to_latex options
    options.shift # retirer le titre
    self.class.add self
    # Pour le moment :
    "#{titre} (#{titre_fr || '---'}, #{annee})~\\cite{#{id}}"
  end
  
  # Retourne le code à écrire dans le fichier bibliographie
  # 
  # TODO Mais ne vaudrait-il pas mieux faire une unique fichier avec tous
  # les titres de la base et l'utiliser pour tous les books entendu que le programme
  # ne référence que les films/livres trouvés.
  # 
#   def to_biblio
#     <<-EOC
# @misc{#{id},
#   title       = {{#{formate_titre}}},
#   author      = {{#{writers}}},
#   country     = "#{real_pays}",
#   shorttitle  = {{#{titre}}},
#   pitch       = {{#{resume}}},
#   year        = "#{annee}"
# }
# 
#   EOC
#   
#   end
  # Comme je n'arrive pas à composer la bibliography avec bibtex, je
  # la construit à la main dans un environnement thebibliography
  def to_biblio
    <<-EOI
\\bibitem{#{id}}
  \\textsc{\\textbf{#{formate_titre}}},
  #{writers.to_latex},
  #{annee}.\\newline
  {\\advance\\baselineskip -3pt {\\scriptsize #{resume.to_latex}} \\par}\\newline
  \\backref
    EOI
  end
  # Retourne le titre formaté pour la bibliographie
  # 
  def formate_titre
    ftitre = titre_fr || titre
    ftitre += " (#{titre})" unless titre_fr.nil?
    ftitre.to_latex
  end
  
  # Retourne les auteurs du film
  # 
  def writers
    (data[:auteurs] + data[:realisateur]).collect do |dauteur|
      "#{dauteur[:prenom]} #{dauteur[:nom]}" +
      (dauteur[:objet].to_s == "" ? "" : " (#{dauteur[:objet]})")
    end.join(', ')
  end
end