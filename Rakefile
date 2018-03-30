desc 'Run CodeClimate (rubocop, csslint, eslint)'
task :lint do
  sh 'codeclimate analyze'
end

desc 'Concatenate, minify and gzip JS and CSS files; build gem'
task :build do
  sh 'npm run-script build'
  sh 'gem build sequenceserver.gemspec'
end

task :default => [:lint, :build]
