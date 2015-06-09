require 'rspec/core'
require 'rspec/core/rake_task'
require 'rubocop/rake_task'

desc 'Run specs'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

desc 'Run RuboCop'
RuboCop::RakeTask.new :rubocop

desc 'Run GruntCop (bootlint, csslint, jshint)'
task :gruntcop do
  system 'npm run-script cop'
end

desc 'Run all cops'
task :cop => [:rubocop, :gruntcop]

desc 'Concatenate and minify JS & CSS'
task :build do
  system 'npm run-script build'
end

task :default => [:spec, :cop, :build]
