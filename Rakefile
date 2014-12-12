require 'rspec/core'
require 'rspec/core/rake_task'
require 'rubocop/rake_task'

desc 'Run RuboCop to generate HTML report'
RuboCop::RakeTask.new(:rubocop) do |task|
  require 'rubocop'
  task.fail_on_error = false
  cli = RuboCop::CLI.new
  cli.run(%w(--format html -o rubocop.html))
end

desc 'Run main spec testing task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

desc 'Run Coverage tool integration'
RSpec::Core::RakeTask.new(:rcov) do |spec|
  spec.pattern = 'spec/**/*_spec.rb'
  spec.rcov = true
end

task :default => [:spec, :rubocop]
