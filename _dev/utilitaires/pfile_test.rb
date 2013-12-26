require '../interdata/file/ruby/model/pfile'


pfile = PFile.new './_dev/xdivers/textfile.txt'

puts pfile.exists?
puts pfile.to_html

pfile = PFile.new './_dev/xdivers/markdown.md'
puts pfile.to_s