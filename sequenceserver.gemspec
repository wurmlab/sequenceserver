Gem::Specification.new do |s|
  # meta
  s.name        = 'sequenceserver'
  s.version     = '1.0.0-2'
  s.authors     = ['Anurag Priyam', 'Ben J Woodcroft', 'Vivek Rai', 'Yannick Wurm']
  s.email       = ['anurag08priyam@gmail.com', 'b.woodcroft@uq.edu.au']
  s.homepage    = 'http://sequenceserver.com'
  s.license     = 'SequenceServer (custom)'

  s.summary     = 'BLAST search made easy!'
  s.description = <<DESC
SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user interface for use locally or over the web.
DESC

  # dependencies
  s.add_dependency('thin',    '~> 1.6.2')
  s.add_dependency('sinatra', '~> 1.4.5')
  s.add_dependency('ox',      '~> 2.1.1')
  s.add_dependency('slop',    '~> 3.6.0')

  s.add_development_dependency('rack-test', '~> 0.6.2')
  s.add_development_dependency('rspec',     '~> 2.8.0')
  s.add_development_dependency('rake',      '~> 10.3.2')
  s.add_development_dependency('rubocop',   '~> 0.26.1')
  s.add_development_dependency('capybara',   '~> 2.4.4')
  s.add_development_dependency('capybara-webkit',   '~> 1.3.0')

  # gem
  s.files         = Dir['lib/**/*'] + Dir['views/**/*'] + Dir['public/**/*'] + Dir['tests/**/*']
  s.files         = s.files + ['config.ru', 'Gemfile', 'sequenceserver.gemspec']
  s.files         = s.files + ['LICENSE.txt', 'LICENSE.Apache.txt', 'README.md']
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
