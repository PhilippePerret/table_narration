class Fiche
class ParserBalises
class << self

  # Le code à traiter
  # 
  attr_reader :code

  # === Main ===
  # @param  {Fiche} fiche Instance fiche de la fiche à parser
  #                 Traiter sa propriété `latex`
  def parse fiche
    @code = fiche.latex
    
    balises_crochets
    
    balises_html  # Appelé 3 fois pour gérer les balises dans les balises
    balises_html
    balises_html
    
    fiche.latex = @code
  end
  
  # Traitement des balises "objet" contenues éventuellement dans @code
  # 
  # Les balises "objet" concernent les films, les mots du scénodico, les
  # références et les images (TODO: mettre les images dans une autre méthode)
  # 
  def balises_crochets
    return if @code.index('[').nil?
    dlog "Une balise détectée dans #{@code}"
    @code.gsub!(/\[(film|mot|ref|img):([^\|\]]+)(?:\|([^\|\]]+))?(?:\|([^\]]+))?\]/u){
      tout = $&
      bal = $1
      ide = $2
      val = $3
      opt = ($4 || "").split
      foo = case bal
        when 'film' then Film::new(ide)
        when 'mot'  then Mot::new(ide)
        when 'ref'  then parse_reference ide
        when 'img'  then Image::new(ide, val)
      end
      case bal
        when 'film', 'mot', 'ref'
          foo.to_latex( opt.unshift(val) )
        else # pour toutes les autres balises
          foo.to_latex
      end
    }
  end
  
  # Traitement d'une référence
  # --------------------------
  # @return {Ref} L'instance Ref de la référence, dont on appellera la
  #               méthode `to_latex`
  # Ce traitement est isolé pour pouvoir voir si la référence fait référence
  # à un autre livre, donc à un document externe.
  # Si c'est le cas, elle renseigne la liste $IDS_BOOKS_XR qui se chargera de
  # préciser à LaTex de charger les livres externes.
  # Noter qu'une erreur peut être produite si le livre externe n'a pas encore 
  # été publié (voir si elle est fatale)
  def parse_reference ref
    $IDS_BOOKS_XR
    Ref::new(ref) # l'instance référence
  end
  # Traitement des balises HTML (<i>, <u>, etc.) contenues dans @code
  # TODO: Normalement, je devrais mettre ça dans RLatex
  def balises_html
    @code.gsub!(/<(i|u|b|del|ins|strong|stroke|tt|bad)>(.*?)<\/\1>/um){
      tout  = $&
      tag   = $1
      text  = $2
      markerout = case tag
      when 'tt'           then "tterm"  # commande définie dans source/asset.tex
      when 'u'            then "uline"  # requires 'ulem' package
      when 'del','stroke' then "sout"   # requires 'ulem' package
      when 'ins'          then "uline"  # requires 'ulem' package
      when 'bad'          then "uwave"  # requires 'ulem' package
      else false
      end
      markerin = case tag
      when 'i'            then "itshape"
      when 'b', 'strong'  then "bfseries"
      else false
      end
      if markerout
        "\\#{markerout}{#{text}}"
      else
        "{\\#{markerin} #{text}}"
      end
    }
  end
end
end
end