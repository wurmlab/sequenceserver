require 'rspec/core'
require 'rspec/core/rake_task'

desc 'Run specs'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

desc 'Run CodeClimate (rubocop, csslint, eslint)'
task :lint do
  sh 'codeclimate analyze'
end

desc 'Concatenate, minify and gzip JS and CSS files; build gem'
task :build do
  sh 'npm run-script build'
  sh 'gem build sequenceserver.gemspec'
end

task :default => [:spec, :lint, :build]
