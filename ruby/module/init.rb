#encoding: UTF-8

=begin

Initialisation du script ajax

Charge les modèles indispensables

=end

require './ruby/model/collection'
require './ruby/model/fiche'
require './ruby/lib/functions'

require './ruby/module/paragraph_styles'
StylesParagraph.update_styles_paragraph_if_needed
