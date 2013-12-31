=begin
  Class ParserPType
  -----------------
  Traitement des ptype de paragraphe particuliers (qui nécessitent plus d'une
  ligne de code)
=end
class Fiche
class ParserPType
class << self
  attr_reader :code
  
  # Méthode principale
  # Notes
  # -----
  #   * La méthode appelante met le code dans fiche.latex
  # 
  # @param  {Fiche} fiche L'instance fiche à parser suivant son ptype
  # 
  def parse fiche
    @code = fiche.latex
    send('as_' + fiche.ptype)
  end
  
  def as_list
    "\\begin{itemize}\n" + 
    @code.split("\n").collect do |line|
      "\\item #{line}"
    end.join("\n") + "\n\\end{itemize}\n"
  end
  
  def as_enum
    "\\begin{enumerate}\n" + 
    @code.split("\n").collect do |line|
      "\\item #{line}"
    end.join("\n") + "\n\\end{enumerate}\n"
  end
  
  def as_desc
    "\\begin{description}\n" + 
    @code.split("\n").collect do |line|
      mot, desc = line.split('::')
      "\\item[#{mot}] \\hfill \\\n#{desc}"
    end.join("\n") + "\n\\end{description}\n"
  end
  
  # Comme une table (formatée avec des "|" en première ligne) et
  # des "|---" comme diviseurs de rangée
  def as_tabl
    dlines = @code.strip.split("\n")
    first_line = dlines.shift
    # Données pour les colonnes
    dcolonnes = first_line.strip[1..-1].split(' ')
    first_col = dcolonnes.first
    nombre_colonnes = dcolonnes.count
    # Préambule pour les colonnes
    # ---------------------------
    cols_definition = nil
    tabular = "tabular"
    u = ""
    if first_col.gsub(/[^0-9]/,'') == first_col
      if dcolonnes.collect{|col| col.to_i}.inject(:+) == 100
        # Une définition par pourcentage
        #  >{\setlength\hsize{.5\hsize}}X>{\setlength\hsize{1.5\hsize}}X}
        # Le nombre total que doivent donner les x\hsize correspondent aux 
        # nombre de colonnes. S'il y a 2 colonnes, la somme doit faire 2,
        # s'il y a trois colonnes, la somme doit faire 3
        tabular = "tabularx" # il faut utiliser ce package
        cols_definition = dcolonnes.collect do |width|
          width = width.to_i
          ">{\\setlength\\hsize{#{(nombre_colonnes * width).to_f/100}\\hsize}}X"
        end.join('|')
        # Contrairement à tabular qui ne prend qu'un argument, tabularx en
        # prend deux :
        #   {width}{définition des colones}
        # Notez ci-dessous que l'accolade ouvrante et l'accolade fermante ne sont
        # pas mis, puisqu'elle seront posées plus bas.
        cols_definition = "\\linewidth}{|#{cols_definition}|"
      else
        u = "px"
      end
    end
    if cols_definition.nil?
      cols_definition = dcolonnes.collect{|col| "p{#{col}#{u}}"}.join('|')
      cols_definition = "|#{cols_definition}|"
    end
    rows = []
    cols = []
    dlines.each do |line|
      line = line[1..-1].strip
      if line.start_with? '---'
        cols = []
      else
        cols += line.split('||')
        if cols.count >= nombre_colonnes
          rows << "\\hline #{cols[0..(nombre_colonnes-1)].join(' & ')}"+'\\ '
        end
      end
    end
    # Le texte renvoyé
    '\noindent' + "\n" +
    "\\begin{#{tabular}}{#{cols_definition}}\n"+
    rows.join("\n") + "\n" +
    "\\hline"+
    "\\end{#{tabular}}\n"
  end
  
  # Traiement des évènemenciers
  def as_revc
    dlog "Les paragraphes de ptype `revc` ne sont pas encore traités"
  end
end
end
end