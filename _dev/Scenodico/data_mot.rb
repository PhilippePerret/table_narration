#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8


MOT_ID = 'keyscene'

MOT_PATH = File.join('..', 'interdata', 'scenodico', 'mots', "#{MOT_ID}.msh")

if File.exists? MOT_PATH
  dmot = Marshal.load(File.read MOT_PATH)
  dmot.each { |k, val| puts ":#{k} => #{val.inspect}" }
else
  puts "### IMPOSSIBLE DE TROUVER LE MOT #{MOT_ID}"
end