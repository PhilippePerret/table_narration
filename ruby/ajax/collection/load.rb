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

# Dans le cas où le dossier n'existerait pas, on le crée avec tout ce qui 
# est nécessaire dedans
load './ruby/module/prepare_folder.rb' unless File.exists? Collection::folder


# Méthode principale appelée pour charger les fiches nécessaires
# de la collection à son chargement.
def get_all_fiches_needed
  log "---> get_all_fiches_needed"
  unless File.exists? File.join(Fiche::folder)
    log "<- get_all_fiches_needed (dossier fiche inexistant => aucune fiche à lire)"
    return
  end
  get_all_books
  get_all_non_ranged
end

def get_all_books
  log "---> get_all_books"
  Dir["#{Fiche::folder}/book/*.msh"].each do |path|
    data_book = Marshal.load(File.read path)
    ibook = Fiche.new(data_book['id'], 'book')
    @data[:fiches] += ibook.get_data :children => :if_opened
  end
  log "<- get_all_books"
end

def get_all_non_ranged
  log "---> get_all_non_ranged"
  new_liste = []
  Collection.non_rangeds.each do |idtype|
    next if idtype.strip == ""
    id, type = idtype.split(':')
    fiche = Fiche.new(id, type)
    next unless fiche.exists?
    next unless fiche.ranged?
    # Si on arrive ici, c'est que la fiche n'est toujours pas rangée
    new_liste << "#{fiche.id}:#{fiche.type}"
    @data[:fiches] += fiche.get_data :children => :if_opened
  end
  
  # On enregistre la nouvelle liste des non rangés
  Collection::save_non_rangeds new_liste
  log "<- get_all_non_ranged"
end

# Retourne la configuration courante si elle existe
# 
# @note CE N'EST PAS la valeur retournée par Collection::current_configuration,
#       qui est une donnée ruby utile pour ce chargement, mais la donnée du fichier
#       simplement parsée par JSON.
# 
# @note Détruit toujours le fichier configuration, qui doit être ré-enregistré
#       quand on quitte l'application.
# 
def get_config
  @data[:data][:current_configuration] = 
    if File.exists? Collection::path_current_config
      # Marshal.load(File.read Collection::path_current_config)
      config = JSON.parse(File.read Collection::path_current_config)
      File.unlink Collection::path_current_config
      config
    else
      nil
    end
end

@data = {
  :fiches   => [],
  :prefs    => {},
  :data     => {
    :last_id_fiche => Fiche::last_id,
    :current_configuration => nil
  }
}
get_all_fiches_needed
get_config
RETOUR_AJAX[:data] = @data
RETOUR_AJAX[:mode_test] = File.exists?('./.mode_test')