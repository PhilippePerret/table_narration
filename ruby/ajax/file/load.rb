# coding: UTF-8
=begin

Module qui charge un fichier et l'interprète suivant son type

Le fichier est donné par son path (param :path)

=end

require '../interdata/file/ruby/model/pfile.rb'

file_path = param :file_path

# Si le fichier n'existe pas, il se trouve peut-être dans le dossier 'ressource'
# de la collection. Dans le cas contraire, on considère qu'il doit se trouver
# dans ce dossier. Si file_path contient une hiérarchie de sous-dossiers mais que
# ces sous-dossiers n'existent pas, le script produira une erreur car il ne peut/doit
# créer un fichier que si son dossier existe.
unless File.exists? file_path
  file_path = File.join(Collection::folder_ressource_textes, file_path)
end
pfile = PFile.new file_path
if pfile.exists?
  RETOUR_AJAX[:file_real_text] = pfile.to_html
else
  # Ici le fichier n'existe pas. Mais s'il est dans une hiérarchie connue, on
  # le crée. C'est la manière de créer simplement un fichier ciblé.
  if File.exists?(File.dirname file_path)
    pfile.create
    RETOUR_AJAX[:need_create] = "Le fichier `#{file_path}' n'existait pas mais je l'ai créé."
    RETOUR_AJAX[:file_real_text] = pfile.texte_provisoire
  else
    RETOUR_AJAX[:ok]      = false
    RETOUR_AJAX[:message] = "Le fichier `#{param :file_path}' est introuvable…\n"+
                            "Si tu veux créer le fichier, il faut au moins que son dossier existe."
  end
end