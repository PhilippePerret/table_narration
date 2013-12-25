=begin

Pour procéder à une recherche dans toutes les fiches

Cf. la méthode JS `Search.find` pour le détail des paramètres

Arguments
---------
param :text     Le texte à rechercher
param :params   Les paramètres de la recherche

Retour
------
Retourne :found {Object} Contenant tous les éléments correspondant à la recherche

=end
class String
  def without_returns
    self.gsub!(/\n/, '\\n')
    self
  end
end


@search_param = (param :params)
@search_param['dev-min'] = @search_param['dev-min'].to_i
@search_param['dev-max'] = @search_param['dev-max'].to_i
@search_param['whole_text'] = @search_param['whole_text'] == "true"

# On étudie la condition qui peut être un texte brut ou une expression
# régulière
searched = @search_param['search_text']
unless searched == ""
  search_escaped = Regexp.escape(@search_param['search_text'])
  @regexp = if searched.start_with?('/') && searched.end_with?('/')
    /(#{searched[1..-2]})}/iox
  else
    /\b(#{search_escaped})\b/iox
  end
  def text_is_valid?
    offs = 0
    @current[:matches] = []
    text = main_value
    while found = text.match(@regexp, offs)
      # puts found.inspect
      offs += found.begin(0) + 1
      prem = found.pre_match
      prem = prem[-21..-1] if prem.length > 20
      @current[:matches] << {
        :pre    => prem.to_s.without_returns, 
        :found  => found.to_s.without_returns, 
        :post   => found.post_match[0..20].to_s.without_returns,
        :offset => offs - 1
      } 
    end
    return @current[:matches].count > 0
  end
end

@found = {
  :nombre_founds          => 0,
  :founds                 => [], # fiches remontées
  :nombre_fiches_etudiees => 0,
  :nombre_rejecteds       => 0,
  :param_search           => (param :params)
}

# Enregistre les fiches OK
# @param {Hash} La données de la fiche (telle que relevée dans le fichier)
def memorize_current
  @found[:founds] << {
    :id       => @current['id'], 
    :type     => @current['type'],
    :incipit  => main_value_for_retour,
    :matches  => @current[:matches]
  }
  @found[:nombre_founds] += 1
end

# Retourne le texte qui sera mémorisé pour retour, en fonction du type
# de fiche et du texte recherché
# La méthode travaille sur @current, la fiche courante
def main_value_for_retour
  texte = main_value
  texte = texte[0..66] + " […]" if texte.length > 70 && !@search_param['whole_text']
  texte.to_s.without_returns
end
# Retourne le texte à considérer en fonction de la fiche
# La méthode travaille sur @current, la fiche courante
def main_value
  texte = @current['type'] == 'para' ? @current['texte'] : @current['titre']
end

# Retourne true si la fiche courante (@current) a le niveau de
# développement requis (propriété 'dev')
def devlevel_requis?
  return true if @current['dev'].nil? # compatibilité ancienne version
  dev = @current['dev'].to_i
  dev >= @search_param['dev-min'] && dev <= @search_param['dev-max']
end

# Étudie la validité du texte de la fiche courante @current
# Return true si le texte correspond à la recherche, false otherwise
# Notes
# -----
#   * La méthode travaille sur @current, les data de la fiche courante
#     telles que relevées dans le fichier
#   * La méthode text_is_valid? (défini en haut) retourne TRUE si le texte
#     a été trouvé. En plus, elle renseigne la propriété @current[:matches]
#     en y injectant tous les textes trouvés dans des {Hash} définissant :
#     :pre => le texte avant, :found => le texte exact trouvé, :post => le
#     texte après.
def texte_valide?
  return true if @search_param['search_text'] == ""
  return text_is_valid?
end
# Fouille dans le dossier fiches +folder_path+
# C'est ici que sont étudiées les fiches
# Noter que ne passe ici que les types voulus
# @param  {String} folder_path  Chemin d'accès au dossier du type de fiche
def search_in_folder folder_path
  Dir["#{folder_path}/*.msh"].each do |path|
    @current = Marshal.load(File.read path)
 
    @found[:nombre_fiches_etudiees] += 1
    
    begin
      # Passer les fiches non imprimées, sauf si on doit les considérer
      # 
      raise 'not_valid' if @current['not_printed'] == "true" && !@search_param['even_not_printed']

      # La fiche a-t-elle le niveau de développement requis ?
      raise 'not_valid' unless devlevel_requis?

      # Si une recherche par texte doit être effectuée, on le filtre
      # 
      raise 'not_valid' unless texte_valide?

      # Si la fiche arrive ici, c'est qu'elle correspond à la recherche, 
      # on l'enregistre
      memorize_current
      
    rescue Exception => e
      if e.message == 'not_valid'
        @found[:nombre_rejecteds] += 1
      else
        raise e
      end
    end
    
    
  end
end

all_type_fiche = (@search_param['type_fiche-all'] == "true")
@search_text = @search_param['search_text']

# On boucle sur toutes les fiches voulues 
Dir["#{Collection::folder_fiches}/*"].each do |path|
  next unless File.directory? path
  type_fiche = File.basename(path) # p.e. 'book'
  if all_type_fiche || @search_param['type_fiche-'+type_fiche] == "true"
    search_in_folder path
  end
end

RETOUR_AJAX[:found] = @found
