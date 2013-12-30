#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

# ! /Users/philippeperret/.rvm/rubies/ruby-1.9.3-p484/bin/ruby

=begin

  Script ajax. Mais par commodité, c'est le script PHP qui reçoit la requête et qui 
  appelle ce script.
  
  Toutes les variables envoyées par ajax dans `data' sont transformées en propriété.
  Donc si on a appelé ajax par…

    Ajax.send{{ma_donnee:"La valeur de ma données"}}

  … alors tous les scripts ruby pourront faire appel à cette donnée par :

      param('ma_donnee')
  
  Les valeurs à renvoyer au programme sont à mettre dans RETOUR_AJAX
  NE PAS TOUCHER À :
    - ok
    - message
    
=end

require 'rubygems'
require 'json'

# puts '{"reponse":"ok", "version":"'+RUBY_VERSION+'"}'

# Méthode permettant d'obtenir les valeurs postées
# @usage:     param(<key>) # => retourne la valeur <key> envoyée par POST
def param(key); Params::get_param(key) end
class Params
  @@PARAMS = {}
  def self.init posted_value
    JSON.parse(posted_value).each{ |k,v| set_param(k,v) }
  end
  def self.get_param key
    @@PARAMS[key.to_sym]
  end
  def self.set_param key, value
    @@PARAMS ||= {}
    key = key.to_sym
    @@PARAMS[key] = case value
                      when "true"   then true
                      when "false"  then false
                      when "null"   then nil
                      else value
                    end
  end
end

RETOUR_AJAX = {
  :ok       => true,
  :message  => nil
}

# Permet de définir une erreur sans le backtrace
# @note Car l'utilisation de `raise "<l'erreur fonctionnelle>"' entrainerait
#       l'écriture du backtrace.
# 
def error message
  RETOUR_AJAX[:ok]      = false
  RETOUR_AJAX[:message] = message
end

begin
  # Initialiser
  require './ruby/module/init.rb'
  
  # Prendre les données envoyées
  Params::init(ARGV[0])
  
  # Si la collection est fournie, on la définit comme
  # collection courante
  Collection::choose(param :collection) unless (param :collection).nil?
  
  # Jouer le script
  require "./ruby/ajax/#{param('script')}.rb"
  
  # Fermer le fichier log si nécessaire
  # Fonction dans ./ruby/lib/functions.rb
  closelog
  
rescue Exception => e
  RETOUR_AJAX[:ok]        = false
  RETOUR_AJAX[:message]   = e.message + '<br />' + e.backtrace.join('<br>')
  RETOUR_AJAX[:returned]  = e.message
end

puts RETOUR_AJAX.to_json