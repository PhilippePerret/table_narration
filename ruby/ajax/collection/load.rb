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
configuration courante qui définit quelles fiches sont visibles et surtout
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
def get_all_fiches_visibles
  log "---> get_all_fiches_visibles"
  unless File.exists? File.join(Fiche::folder)
    log "<- get_all_fiches_visibles (dossier collection inexistant => aucune fiche à lire)"
    return
  end
  Collection::current_configuration[:visibles].each do |fiche|
    # @note: `fiche' est une instance {Fiche}
    @data[:fiches] += fiche.get_data :children => :if_opened
  end
end

@data = {
  :fiches   => [],
  :prefs    => {},
  :data     => {
    :last_id_fiche          => Fiche::last_id,
    :current_configuration  => Collection::raw_current_config
  }
}
get_all_fiches_visibles
# Collection::kill_current_configuration
RETOUR_AJAX[:data]      = @data
RETOUR_AJAX[:mode_test] = File.exists?('./.mode_test')