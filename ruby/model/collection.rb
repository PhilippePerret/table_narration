class Collection
  class << self
    
    def folder
      @folder ||= File.join('.', 'collection', 'current')
    end
  end
end