require File.expand_path('lib/sequenceserver/version.rb',
                         File.dirname(__FILE__))
Gem::Specification.new do |s|
  # meta
  s.name        = 'sequenceserver'
  s.version     = SequenceServer::VERSION
  s.authors     = ['Anurag Priyam', 'Ben J Woodcroft',
                   'Vivek Rai', 'Yannick Wurm']
  s.email       = ['anurag08priyam@gmail.com', 'b.woodcroft@uq.edu.au']
  s.homepage    = 'http://sequenceserver.com'
  s.license     = 'GNU AGPL v3'

  s.summary     = 'BLAST search made easy!'
  s.description = <<DESC
SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user
interface for use locally or over the web.
DESC

  # dependencies
  s.add_dependency('sinatra', '~> 1.4',  '>= 1.4.5')
  s.add_dependency('json',    '~> 1.8',  '>= 1.8.2')
  s.add_dependency('ox',      '~> 2.1',  '>= 2.1.1')
  s.add_dependency('slop',    '~> 3.6',  '>= 3.6.0')

  s.add_development_dependency('rack-test',       '~> 0.6',  '>= 0.6.2')
  s.add_development_dependency('rspec',           '~> 2.8',  '>= 2.8.0')
  s.add_development_dependency('rake',            '~> 10.3', '>= 10.3.2')
  s.add_development_dependency('rubocop',         '~> 0.31', '>= 0.31.0')
  s.add_development_dependency('capybara',        '~> 2.4',  '>= 2.4.4')
  s.add_development_dependency('capybara-webkit', '~> 1.3',  '>= 1.3.0')
  s.add_development_dependency('codeclimate-test-reporter',
                               '~> 0.4', '>= 0.4.7')

  # gem
  s.files         = `git ls-files`.split
  s.executables   = ['sequenceserver']
  s.require_paths = ['lib']

  # post install information
  s.post_install_message = <<INFO

------------------------------------------------------------------------
  Thank you for installing SequenceServer :)!

  To launch SequenceServer execute 'sequenceserver' from command line.

    $ sequenceserver


  Visit http://sequenceserver.com for more.
------------------------------------------------------------------------

INFO
end
