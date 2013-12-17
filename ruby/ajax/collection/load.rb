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

Configuration courante
----------------------
Pour connaitre les fiches ouvertes, le script se sert maintenant de la 
configuration courante qui définit quelles fiches sont on_table et surtout
ouvertes (les propriétés `opened` et `ranged` ne sont plus enregistrées dans
les fiches, elles sont respectivement false et true par défaut à la création
des fiches).

NOTES
-----

  @ Le chargement de la collection vérifie aussi si on est en mode normal ou
    en mode test et remonte l'information ::mode_test => true/false

=end
require 'json'

log "---> #{__FILE__}"


# Méthode principale appelée pour charger les fiches nécessaires
# de la collection à son chargement.
def get_all_fiches_on_table
  log "---> get_all_fiches_on_table"
  unless File.exists? File.join(Fiche::folder)
    log "<- get_all_fiches_on_table (dossier collection inexistant => aucune fiche à lire)"
    return
  end
  Collection::current_configuration[:on_table].each do |fiche|
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

@data = {
  :fiches   => [],
  :data     => {
    :last_id_fiche          => Fiche::last_id,
    :current_configuration  => Collection::raw_current_config,
    :preferences            => Collection::preferences,
    :collection_name        => Collection::name
  }
}
get_all_fiches_on_table

# Détruire la configuration courante (ce qui permettra d'enregistrer la
# nouvelle configuration)
# Collection::kill_current_configuration

RETOUR_AJAX[:data]      = @data
RETOUR_AJAX[:mode_test] = File.exists?('./.mode_test')