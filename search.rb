# search.rb
require 'rubygems'
require 'sinatra'
require 'tempfile'

NDB = '/home/yeban/code/Sinatra/simpleSequenceSearchServer/db/nucleotide/Sinvicta2-2-3.cdna.subset.fasta'
PDB = '/home/yeban/code/Sinatra/simpleSequenceSearchServer/db/protein/Sinvicta2-2-3.prot.subset.fasta'

get '/' do
  erb :search
end

post '/' do
  method = params[ :method ]
  puts params[ :database ]
  database = if params[ :database ] == 'protein'
               PDB
             elsif params[ :database ] == 'nucleotide'
               NDB
             end

  tmp = Tempfile.new("seqfile")
  tmp.puts( params[ :sequence ] )
  tmp.close
  report = `#{method} -db #{database} -query #{tmp.path}`
  tmp.delete
  report
end
