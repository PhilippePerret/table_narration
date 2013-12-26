#encoding: UTF-8
=begin

Chargement de la collection
---------------------------

* La collection chargée est déterminée par (param :collection_name)

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

Configuration courante
----------------------
Pour connaitre les fiches ouvertes, le script se sert maintenant de la 
configuration courante qui définit quelles fiches sont on_table et surtout
ouvertes (les propriétés `opened` et `ranged` ne sont plus enregistrées dans
les fiches, elles sont respectivement false et true par défaut à la création
des fiches).

NOTES
-----
  * Il n'y a plus à proprement parler de "mode test", c'est simplement le nom
    de la collection courante qui détermine ce mode. On est en mode test lorsque
    le fichier ./current (qui contient le nom de la collection courante) contient
     "test"

=end
require 'json'

# Juste pour crée le dossier image
Collection::folder_ressource_images

# Méthode principale appelée pour charger les fiches nécessaires
# de la collection à son chargement.
def get_all_fiches_on_table
  unless File.exists? File.join(Fiche::folder)
    alog "Le dossier de la collection n'existe pas. Aucune fiche à remonter."
    return
  end
  alog "Configuration courante : #{Collection::current_configuration.inspect}"
  # On vérifie que tous les livres soient bien "on_table"
  fiches_on_table = Collection::current_configuration[:on_table]
  on_table = {}
  fiches_on_table.each do |fiche|
    on_table = on_table.merge fiche.id.to_i => true
  end
  Dir["#{Collection::folder_fiches}/book/*.msh"].each do |path|
    bid = File.basename(path, File.extname(path)).to_i
    if on_table[bid].nil?
      alog "# Le livre ##{bid} devrait se trouver sur la table… Je l'ajoute."
      fiches_on_table << Fiche.new( bid, 'book' )
    end
  end
  fiches_on_table.each do |fiche|
    # @note (ci-dessus): `fiche' est une instance {Fiche}
    # @note (ci-dessous): Pour palier certains problèmes, comme lorsqu'un chapitre
    # a été créé d'abord sur la table, puis la configuration a été enregistré (donc le
    # chapitre a été marqué visible), puis le chapitre a été inséré dans un livre
    # fermé. Il n'est alors plus visible.
    # On part du principe que tout élément qui a un parent ne peut pas être
    # visible, il peut être ouvert, en revanche.
    if fiche.orpheline?
      @data[:fiches] += fiche.get_data :children => :if_opened
    elsif fiche.page?
      @data[:fiches] += fiche.get_data :children => true
      # Si le livre de la page n'est pas ouverte, il faut charger quand même ses
      # enfants, car le clone ne saurait pas où se mettre dans le cas contraire.
      log "fiche #{fiche.id}:#{fiche.type}"
      log "   Parent : #{fiche.parent.inspect}"
      log "   Book   : #{fiche.book.inspect}"
      if fiche.book && fiche.book.closed?
        @data[:fiches] += fiche.book.data_children
      elsif fiche.parent && fiche.parent.closed?
        @data[:fiches] += fiche.parent.data_children
      end
    end
  end
end

# Définition de la collection courante
# ------------------------------------
# 
# Notes
# -----
#   * Si le paramètre :collection_name est défini, on doit changer la
#     collection courante. Sinon, on utilise la collection courante
#     définie dans le fichier ./.current
#   * Si :collection_name n'est pas défini, c'est un premier chargement.
#     On remonte aussi le nom des collections courantes pour préparer le 
#     menu des collections dans l'interface (2e temps, après la définition
#     de @data).
# 
unless (param :collection_name).nil?
  Collection::choose (param :collection_name)
end

alog "Collection courante : #{Collection::name}"

@data = {
  :fiches   => [],
  :data     => {
    :last_id_fiche          => Fiche::last_id,
    :current_configuration  => Collection::raw_current_config,
    :preferences            => Collection::preferences,
    :collection_name        => Collection::name
  }
}
# On relève tous les noms de collection pour peupler le menu
# collections de l'interface
if (param :collection_name).nil?
  @data[:data][:collections] = Collection::all_names
end

get_all_fiches_on_table

# Détruire la configuration courante (ce qui permettra d'enregistrer la
# nouvelle configuration)
# Collection::kill_current_configuration

RETOUR_AJAX[:data]      = @data
