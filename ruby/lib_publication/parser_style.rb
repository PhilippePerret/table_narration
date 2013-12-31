=begin

  Class Fiche::ParserStyle
  ------------------------
  Elle permet d'effectuer un traitement particulier sur les paragraphes en
  fonction de leur style.

  Fonctionnement
  --------------
  * Il suffit de définir la méthode <nom du style de paragraphe> ci-dessous pour
    que le paragraphe soit traité.
  * Chaque méthode doit recevoir `fiche`, l'instance {Fiche} de la fiche.
  * La méthode récupère le texte du paragraphe par <fiche>.latex et doit mettre
    le paragraphe traité dans cette même propriété (attr_accessor) par :
      `<fiche>.latex = <valeur traitée>`

  Notes
  -----
  * Les méthodes sont appelées par <#Fiche>.traite_per_style défini dans 
    `./ruby/lib_publication/fiche.rb
  
=end
class Fiche
class ParserStyle
class << self
  def scenario_character fiche
    fiche.latex = fiche.latex.upcase
  end
  def scenario_scene fiche
    fiche.latex = fiche.latex.upcase
  end
end
end
end