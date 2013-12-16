#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Module de "réparation" de la collection

L'opération de réparation consiste à :
  - réparer le fichier de configuration courante, en vérifiant que toutes
    les fiches orphelines soient bien marquées on_table.
  - indiquer les erreurs de références (liens vers une fiche inexistante)
  - indiquer les erreurs de parentés (non concordance entre parent et enfants)
  - indiquer/réparer les erreurs de styles de paragraphe qui n'existent plus

=end
require './ruby/lib/functions'
require './ruby/model/fiche'
require './ruby/model/collection'

# ---------------------------------------------------------------------
#   Définition de l'opération
#   -------------------------
# 
REPARER = true # mettre à true pour réparer (sinon, simple check)

# Si true, supprimera de la liste des enfants les fiches qui n'ont pas
# été trouvées. À utiliser en toute connaissance de cause ! Dans la plupart
# des cas, il est préférable de retrouver la fiche dans un backup.
SUP_UNFOUND_CHILDREN = REPARER && false

# / fin de définition de l'opération
# ---------------------------------------------------------------------

def load_data_phil
  require './data/secret/data_phil'
end
def autorise path
  load_data_phil unless defined?(DATA_PHIL)
  `echo "#{DATA_PHIL[:password]}" | sudo -S chmod 0777 #{path}`  
end


$new_config = {:on_table=>[], :openeds=>[], :orphelines=>[]}

log "#{REPARER ? 'Réparation' : 'Check'} de la collection : #{Collection::folder}"

def verifier
  Collection::each_fiche do |fiche|
    fiche.check_if_visible_in_configuration
    fiche.check_enfants
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
    line = "#{data_fiche_for_line} ERRORS:#{err_counter}"
    if REPARER
      line += " REPARATIONS:#{reparation_counter}"
    end
    line += "\n\t" + @errors.join("\n\t") unless @error_counter.nil?
    line
  end
  # Les données générales de la fiche
  def data_fiche_for_line
    enfants_count = "%-3i" % (children || []).count
    "Fiche ##{id6} #{type} #{mark_child} Enfants:#{enfants_count}"
  end
  def mark_child
    if book? then '     '
    elsif hasParent? then 'child'
    else 'orphe'
    end
  end
  
  # ---------------------------------------------------------------------
  # 
  #   MÉTHODES DE CHECK
  # 
  # ---------------------------------------------------------------------
  
  # Vérifie si les enfants définis dans la fiche existent toujours
  # 
  def check_enfants
    new_enfants = []
    (children || []).each do |dchild|
      child = Fiche::get(dchild['id'].to_i)
      if child.nil?
        error "L'enfant #{dchild['id']}:#{dchild['type']} est introuvable…"
      else
        # L'enfant doit définir le bon parent
        if child.parent.nil? || child.parent.id != id
          error "L'enfant #{child.id}:#{child.type} ne définit pas le bon parent "+
              "(expected:#{id}:#{type}, valeur:"+
              (child.parent.nil? ? "Aucun parent défini (#{child.data['parent']})" : "#{child.parent.id}:#{child.parent.type})")
        end
        new_enfants << dchild
      end
    end
    if REPARER && SUP_UNFOUND_CHILDREN
      # Il faut enregistrer la nouvelle liste d'enfants
      merge( 'enfants' => new_enfants )
    end
  end
  # Vérifie si les fiches orphelines sont bien dans la configuration
  # générale
  # 
  def check_if_visible_in_configuration
    # Pour provoquer la lecture du fichier de configuration courante
    Collection::current_configuration
    if orpheline? && invisible?
      # => PROBLÈME
      error "devrait être visible"
      incremente_reparation if REPARER
    end
    $new_config[:on_table] << {:id => id, :type => type} if orpheline?
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