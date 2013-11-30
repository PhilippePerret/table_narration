#encoding: UTF-8
=begin

Chargement de la collection (normale ou test)
---------------------------------------------

Ce script retourne TOUTES les informations utiles pour l'affichage de la collection

Il s'agit de :
  - La liste utile des fiches (i.e. celles qu'on verra - cf. ci-dessous)
  - Les préférences de l'application (TODO)

Le script renseigne la propriété :data qui sera ensuite dispatchée dans 
l'application

Fiches à charger
----------------

Par nature, les fiches à charger sont :
  - Tous les livres (qui sont forcément affichés)
  - Les chapitres et pages de tous les livres ouverts
    (car quand un livre est ouvert, on voit sa table des matières, donc la liste
     de ses chapitres et la table des matières de ces chapitres, donc les titres
     des pages)
  - Toutes les fiches (hors livres) qui n'ont pas de parents (qui sont donc posées
    telles quelles sur la table)
  - Toutes les fiches (hors livres) qui ne sont pas rangées dans leur parent (qui
    sont donc `opened`).

Réflexion
---------

Imaginons qu'à chaque modification de fiche (fiche/save), on tienne à jour
une liste des `ranged' et des 'opened' (ou seulement non 'ranged' ?).
Quand on charge l'application : on lit cette liste, et on regarde si la fiche est
encore ouverte. Si c'est le cas, on la charge. 
Ici, on actualise cette liste en ne gardant que les fiches vraiment opened.
=> Liste des 'non_ranged'

=end


# Dans le cas où le dossier n'existerait pas, on le crée avec tout ce qui 
# est nécessaire dedans
load './ruby/module/prepare_folder.rb' unless File.exists? Collection::folder


def get_all_fiches_needed
  get_all_books
  get_all_non_ranged
end

def get_all_books
  Dir["#{Collection::folder}/fiche/book/*.js"].each do |path|
    book = JSON.parse(File.read(path))
    @data[:fiches] << book
    get_children_of(Fiche.new(book['id'], 'book')) if book['opened'] == "true"
  end
end

# Relève tous les enfants de la fiche +fiche+ ({instance Fiche})
def get_children_of fiche
  return unless fiche.hasChildren?
  fiche.children.each do |minidata|
    child = Fiche.new(minidata['id'], minidata['type'])
    @data[:fiches] << child.data
    get_children_of( child ) if child.chapter?
  end
end


def get_all_non_ranged
  new_liste = []
  Collection.non_rangeds.each do |idtype|
    next if idtype.trim == ""
    id, type = idtype.split(':')
    fiche = Fiche.new(id, type)
    next unless fiche.exists?
    next unless fiche.ranged?
    # Si on arrive ici, c'est que la fiche n'est toujours pas rangée
    new_liste << "#{fiche.id}:#{fiche.type}"
    @data[:fiches] << fiche.data
    get_children_of fiche unless fiche.paragraph?
  end
  
  # On enregistre la nouvelle liste des non rangés
  Collection::save_non_rangeds new_liste
end


@data = {
  :fiches   => {}
}
get_all_fiches_needed
RETOUR_AJAX[:data] = @data