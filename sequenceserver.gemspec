Gem::Specification.new do |s|
  # meta
  s.name        = 'sequenceserver'
  s.version     = '0.8.1'
  s.authors     = ['Anurag Priyam', 'Ben J Woodcroft', 'Yannick Wurm']
  s.email       = 'anurag08priyam@gmail.com'
  s.homepage    = 'http://sequenceserver.com'
  s.license     = 'SequenceServer (custom)'

  s.summary     = 'BLAST search made easy!'
  s.description = <<DESC
SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user interface for use locally or over the web.
DESC

  # dependencies
  s.add_dependency('bundler', '~> 1.2.0')
  s.add_dependency('sinatra', '>= 1.2.0')
  s.add_dependency('ptools')

  s.add_development_dependency('minitest')
  s.add_development_dependency('rack-test')

  # gem
  s.files         = Dir['lib/**/*'] + Dir['views/**/*'] + Dir['public/**/*'] + Dir['tests/**/*']
  s.files         = s.files + ['config.ru',   'example.config.yml']
  s.files         = s.files + ['LICENSE.txt', 'LICENSE.Apache.txt', 'README.txt']
  s.files         = s.files + ['Gemfile',     'sequenceserver.gemspec']
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
