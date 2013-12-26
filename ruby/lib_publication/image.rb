=begin

Class Image pour la publication
-------------------------------

Principe
--------
Pour pouvoir être utilisé dans un fichier .tex, Image prend le fichier 
original, qui doit être en jpg ou png par exemple, et le convertit en image
PostScript dans le dossier pour publication.



=end
require 'json'
require 'fileutils'
require 'dimensions' # pour obtenir les dimensions de l'image
# require 'rmagick'

class Image
  
  # Path relative (ou non) fournie
  # 
  attr_reader :rel_path
  
  # {Object} Attributs contenus par la balise
  # 
  attr_reader :attrs
  
  def initialize relpath, attrs = nil
    @rel_path = relpath
    @attrs    = attrs
    traite_attrs
  end
  
  # Prends les attributs tels que fourni à l'instanciation (simple string)
  # et les transforme en Hash avec clé symboliques
  def traite_attrs
    params = "#{@attrs}"
    @attrs = {}
    if params.nil? || params == ""
      # Rien à faire
    else
      params.strip_slashes.split(' ').each do |duo|
        att, val = duo.split('=')
        @attrs = @attrs.merge( att.strip.to_sym => val.strip )
      end
    end
  end
  
  # Retourne le code pour les options de la balise includegraphicx LaTex
  # Notes
  # -----
  #   * La méthode se sert du gem 'dimensions' pour obtenir les dimensions
  #     de l'image et composer le `bb` (BoundingBox) de l'image eps.
  #   * Puis elle se sert des attributs précisés dans la balise pour affiner
  #     la taille, la position et la rotation.
  # 
  # @return {String} options (sans square brackets)
  def options_includegraphics
    options = []
    width, height = Dimensions.dimensions(real_path)
    dlog "Dimensions de l'image #{affixe} : #{width}x#{height}"
    options << "bb=0 0 #{width} #{height}"
    if @attrs
      [:width, :height, :scale].each do |prop|
        val = @attrs[prop]
        options << "width=#{val}" unless val.nil?
      end
    else
      options << "width=#{width}px"
    end
    options.join(',')
  end
  # Retourne le code à copier dans le fichier LaTex
  # 
  # TODO: Utiliser aussi une marque pour dire que l'illustration peut se
  # trouver dans un 'figure' (flottant). Ou peut-être utiliser l'attribut
  # `float`
  # @return {String} Code à copier dans le fichier .tex
  def to_latex
    copy_in_publication # si nécessaire
    "\\includegraphics[#{options_includegraphics}]{#{relpath_publication}}"
  end
  
  # Retourne l'affixe du fichier
  # 
  def affixe
    @affixe ||= File.basename(rel_path, File.extname(rel_path))
  end
  
  # Retourne le dossier relatif (défini dans la balise)
  # ou nil si le fichier n'est pas dans une hiérarchie
  def rel_path_folder
    @rel_path_folder ||= begin
      d = File.dirname(rel_path)
      d = nil if d == "."
      d
    end
  end
  
  # Retourne le rel_path du fichier postscript
  # Des corrections peuvent être effectuées, si le nom du fichier contient
  # des caractères qui peuvent poser problème, comme l'underscore
  def rel_path_ps
    @rel_path_ps ||= begin
      dpath = []
      dpath << rel_path_folder unless rel_path_folder.nil?
      dpath << "#{affixe.gsub(/[^a-zA-Z0-9-]/, '')}.ps"
      File.join(dpath)
    end
  end
  
  # Retourne le path réel de l'image, en fonction de l'endroit où
  # on trouve l'image
  def real_path
    @real_path ||= cherche_real_path
  end
  def cherche_real_path
    ['given', 'in_folder_lib', 'in_folder_ressource'].each do |rpath|
      path = self.send('path_'+rpath)
      return path if File.exists? path
    end
  end
  
  # Copie le fichier dans le dossier publication (si nécessaire)
  # 
  def copy_in_publication
    unless File.exists? path_publication
      build_folders 
    else
      if File.stat(real_path).mtime > File.stat(path_publication).mtime
        File.unlink path_publication
      end
    end
    FileUtils::cp real_path, path_publication unless File.exists? path_publication
  end
  
  # Le chemin relatif dans publication
  # 
  def relpath_publication
    @relpath_publication ||= File.join('source', 'ressource', Collection::name, 'img', rel_path_ps)
  end

  # Le Path absolu du fichier de publication
  def path_publication
    @path_publication ||= File.expand_path(File.join('.', 'publication', relpath_publication))
  end
  
  # Construit tous les dossiers jusqu'au dossier img dans le dossier
  # publication
  # 
  def build_folders
    current = ""
    dpath = path_publication.split('/')
    dpath.pop
    while dossier = dpath.shift
      current += "#{dossier}/"
      next if File.exists? current
      Dir.mkdir(current, 0777)
    end
  end
  
  # Path telle qu'elle est fournie (juste pour le fonctionnement de cherche_real_path)
  def path_given
    @rel_path
  end
  # Path dans le dossier lib 
  def path_in_folder_lib
    @path_in_folder_lib ||= File.expand_path(File.join('..', 'lib', 'img', rel_path))
  end
  # Path dans le dossier ressource
  def path_in_folder_ressource
    @path_in_folder_ressource ||= File.expand_path(File.join(Collection::folder_ressource_images, rel_path))
  end
  
end