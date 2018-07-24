desc 'Concatenate, minify and gzip JS and CSS files; build gem'
task :build do
  sh 'npm run-script build'
  # FIXME: clean up the dir before gem
  sh 'gem build sequenceserver.gemspec'
end

task default: [:build]
