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
  s.license     = 'AGPL-3.0'

  s.summary     = 'BLAST search made easy!'
  s.description = <<~DESC
    SequenceServer lets you rapidly set up a BLAST+ server with an intuitive
    user interface for use locally or over the web.
  DESC

  # dependencies
  s.required_ruby_version = '>= 2.3.0'

  s.add_dependency('json_pure', '~> 1.8',  '>= 1.8.2')
  s.add_dependency('ox',        '~> 2.1',  '>= 2.1.1')
  s.add_dependency('sinatra',   '~> 2.0',  '>= 2.0.0')
  s.add_dependency('slop',      '~> 3.6',  '>= 3.6.0')
  s.add_dependency('rest-client','~> 2.1.0')

  s.add_development_dependency('capybara', '~> 3.15', '>= 3.15.1')
  s.add_development_dependency('capybara-screenshot', '~> 1.0', '>= 1.0.23')
  s.add_development_dependency('rack-test', '~> 1.0', '>= 1.0.0')
  s.add_development_dependency('rspec', '~> 3.7', '>= 3.7.0')
  s.add_development_dependency('rubocop', '~> 0.75', '>= 0.75.1')
  s.add_development_dependency('selenium-webdriver', '~> 3.142', '>= 3.142.3')
  s.add_development_dependency('simplecov', '~> 0.17.0', '>= 0.17.0')

  # gem
  s.files         = Dir['{bin,lib,public,views}/**/*'] +
                     %w[config.ru COPYRIGHT.txt LICENSE]
  s.executables   = ['sequenceserver']
  s.require_paths = ['lib']

  # post install information
  s.post_install_message = <<~INFO

    ------------------------------------------------------------------------
      Thank you for installing SequenceServer :)

      To launch SequenceServer execute 'sequenceserver' from command line.

        $ sequenceserver


      Visit http://sequenceserver.com for more.
    ------------------------------------------------------------------------

  INFO
end
