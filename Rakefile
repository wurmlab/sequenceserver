require 'rspec/core'
require 'rspec/core/rake_task'
require 'rubocop/rake_task'

desc 'Run RuboCop to generate HTML report'
RuboCop::RakeTask.new :rubocop

desc 'Run main spec testing task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

task :default => [:spec, :rubocop]
