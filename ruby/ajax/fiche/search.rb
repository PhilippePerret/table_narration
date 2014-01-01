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
  # On supprime les retours chariot et toutes les balises HTML
  def without_unwanted
    self.gsub!(/\n/, '\\n')
    self.gsub!(/<\/?(?:[^>]*?)>/u, '')
    self
  end
end

# Longueur maximale pour un extrait de paragraphe (début)
# 
MAX_LENGTH_EXTRAIT = 50

# Longueur maximale de texte qui a va être prise avant et après
# un match de recherche
# @note   Essentiellement utile pour les paragraphes.
#         Les autres types de fiche, puisqu'on checke leur titre, ne pourront
#         que rarement dépasser cette limite.
MAX_BEFORE_AFTER = 100


# Table contenant en clé l'identifiant {Fixnum} de la fiche et en
# valeur son titre.
# Elle permet de renseigner l'appartenance (ancêtre) d'une fiche
# retenue
DFICHES = {}

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
      prem = found.pre_match.to_s.without_unwanted
      prem = prem[-(MAX_BEFORE_AFTER+1)..-1] if prem.length > MAX_BEFORE_AFTER
      post = found.post_match.to_s.without_unwanted
      post = post[0..MAX_BEFORE_AFTER]
      @current[:matches] << {
        :pre    => prem, 
        :found  => found.to_s.without_unwanted, 
        :post   => post,
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

# Charge les données de la fiche d'id +id+ et de type +type+ dans DFICHES
# 
# Noter que cette méthode n'est utile que si la recherche n'est pas faite
# sur TOUS les types de fiches. Dans le cas contraire, la donnée DFICHES
# est renseignée au fur et à mesure de la lecture des fiches (car, par chance,
# on passe d'abord par 'book', puis 'chap', puis 'page', puis 'para')
# 
def load_fiche id, type
  path    = File.join(Collection::folder_fiches, type, "#{id}.msh")
  dfiche  = Marshal.load(File.read path)
  DFICHES[id.to_i] = {:titre => dfiche['titre'], :parent => dfiche['parent']}
end
# Retourne la hiérarchie de titre de la fiche courante 
# (quand mémorisée)
# 
def parents_of_current
  parents = []
  parent  = @current['parent']
  return nil if parent.nil?
  while parent
    id = parent['id'].to_i
    load_fiche( id, parent['type'] ) if DFICHES[id].nil?
    parents.unshift DFICHES[id][:titre]
    parent = DFICHES[id][:parent]
  end
  parents.join(' > ')
end
# Enregistre les fiches OK
# @param {Hash} La données de la fiche (telle que relevée dans le fichier)
def memorize_current
  @found[:founds] << {
    :id       => @current['id'], 
    :type     => @current['type'],
    :parent   => @current['parent'],
    :parents  => parents_of_current,
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
  texte = texte[0..(MAX_LENGTH_EXTRAIT-4)] + " […]" if texte.length > MAX_LENGTH_EXTRAIT && !@search_param['whole_text']
  texte.to_s.without_unwanted
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
    
    # Dans tous les cas, si la fiche n'est pas un paragraphe, on mémorise
    # son titre pour pouvoir renseigner les ancêtres d'une fiche retenue.
    if @current['type'] != 'para'
      DFICHES[@current['id'].to_i] = {
        :titre  => @current['titre'],
        :parent => @current['parent']
      }
    end
    
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
