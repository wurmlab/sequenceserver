require 'find'
require 'digest/md5'

module SequenceServer

  # Captures a BLAST database.
  #
  # Formatting a FASTA for use with BLAST+ will create 3 or 6 files,
  # collectively referred to as a BLAST database.
  Database = Struct.new(:name, :title, :type) do
    def initialize(*args)
      @id = Digest::MD5.hexdigest args[0]
      super
    end

    attr_reader :id

    def to_s
      "#{type}: #{title} #{name}"
    end
  end
end
