# encoding: utf-8

require 'rubygems'
require 'bundler'
begin
  Bundler.setup(:default, :development)
rescue Bundler::BundlerError => e
  $stderr.puts e.message
  $stderr.puts "Run `bundle install` to install missing gems"
  exit e.status_code
end
require 'rake'

require 'jeweler'
Jeweler::Tasks.new do |gem|
  # gem is a Gem::Specification... see http://docs.rubygems.org/read/chapter/20 for more options
  gem.name = "sequenceserver"
  gem.homepage = "http://sequenceserver.com"
  gem.license = "SequenceServer (custom)"
  gem.summary = %Q{BLAST search made easy!}
  gem.description = %Q{SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user interface for use locally or over the web.}
  gem.email = "b.woodcroft@uq.edu.au"
  gem.authors = ['Anurag Priyam', 'Ben J Woodcroft', 'Yannick Wurm']

  gem.post_install_message = <<INFO
------------------------------------------------------------------------
  Thank you for installing SequenceServer :)!

  To launch SequenceServer execute 'sequenceserver' from command line.

    $ sequenceserver

  Visit http://sequenceserver.com for more.
-------------------------------------------------------------------------
INFO
  # dependencies defined in Gemfile
end
Jeweler::RubygemsDotOrgTasks.new

require 'rspec/core'
require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

RSpec::Core::RakeTask.new(:rcov) do |spec|
  spec.pattern = 'spec/**/*_spec.rb'
  spec.rcov = true
end

task :default => :spec

require 'rdoc/task'
Rake::RDocTask.new do |rdoc|
  version = File.exist?('VERSION') ? File.read('VERSION') : ""

  rdoc.rdoc_dir = 'rdoc'
  rdoc.title = "sequenceserver #{version}"
  rdoc.rdoc_files.include('README*')
  rdoc.rdoc_files.include('lib/**/*.rb')
end
