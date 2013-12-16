#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Module de "réparation" de la collection

L'opération de réparation consiste à :
  - réparer le fichier de configuration courante, en vérifiant que toutes
    les fiches orphelines soient bien marquées visibles.
  - indiquer les erreurs de références (liens vers une fiche inexistante)
  - indiquer les erreurs de parentés (non concordance entre parent et enfants)
  - indiquer/réparer les erreurs de styles de paragraphe qui n'existent plus

=end
require './ruby/lib/functions'
require './ruby/model/fiche'
require './ruby/model/collection'

REPARER = true # mettre à true pour réparer (sinon, simple check)

def load_data_phil
  require './data/secret/data_phil'
end
def autorise path
  load_data_phil unless defined?(DATA_PHIL)
  `echo "#{DATA_PHIL[:password]}" | sudo -S chmod 0777 #{path}`  
end


$new_config = {:visibles=>[], :openeds=>[], :orphelines=>[]}

log "#{REPARER ? 'Réparation' : 'Check'} de la collection : #{Collection::folder}"

def verifier
  Collection::each_fiche do |fiche|
    fiche.check_if_visible_in_configuration
  end
  print "Consulter le fichier log pour voir le résultat"
end

def reparer
  verifier
  autorise Collection::folder
  autorise Collection::path_current_config if File.exists? Collection::path_current_config
  Collection::save_current_configuration $new_config
  puts " de la réparation"
end

class ERROR
  class << self
    def incremente_error
      @error_counter ||= 0
      @error_counter += 1
    end
    def add err
      @list ||= []
      @list << err
      incremente_error
    end
    
    def rapport
      if (@error_counter || 0) > 0
        "\n\n###### LA COLLECTION DOIT ÊTRE RÉPARÉE ########\n" +
        "# Nombre d'erreurs rencontrées : #{@error_counter}\n#\n" +
         (@list||[]).join("\n")
      else
        "Aucune erreur rencontrée. La collection est OK"
      end
    end
  end
end
class Fiche
  def id6
    @id6 ||= "% 6s" % id
  end
  def error err
    @errors ||= []
    @errors << err
    incremente_error
    ERROR::incremente_error
  end
  def incremente_error
    @error_counter ||= 0
    @error_counter += 1
  end
  def incremente_reparation
    @reparation_counter ||= 0
    @reparation_counter += 1
  end
  def resultat_line
    err_counter = "%-3s" % (@error_counter || '-').to_s
    reparation_counter = "%-3s" % (@reparation_counter || '-').to_s
    line = "Fiche ##{id6} #{type} #{mark_child} ERRORS:#{err_counter}"
    if REPARER
      line += " REPARATIONS:#{reparation_counter}"
    end
    line += "\n\t" + @errors.join("\n\t") unless @error_counter.nil?
    line
  end
  def mark_child
    if book? then '     '
    elsif hasParent? then 'CHILD'
    else 'ORPHE'
    end
  end
  def check_if_visible_in_configuration
    # Pour provoquer la lecture du fichier de configuration courante
    Collection::current_configuration
    if orpheline? && invisible?
      # => PROBLÈME
      error "devrait être visible"
      incremente_reparation if REPARER
    end
    $new_config[:visibles] << {:id => id, :type => type} if orpheline?
  end
end
# C'est ici qu'on lance la procédure
REPARER ? reparer : verifier
# Rapport d'erreur
log ERROR::rapport
Collection::each_fiche do |fiche| log fiche.resultat_line end
if REPARER
  log "Nouvelle configuration courante enregistrée :\n#{$new_config.inspect}"
end