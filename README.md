[![build status](https://secure.travis-ci.org/yannickwurm/sequenceserver.png?branch=master)](https://travis-ci.org/yannickwurm/sequenceserver)
[![code climate](https://codeclimate.com/github/yannickwurm/sequenceserver/badges/gpa.svg)](https://codeclimate.com/github/yannickwurm/sequenceserver)
[![coverage](https://codeclimate.com/github/yannickwurm/sequenceserver/badges/coverage.svg)](https://codeclimate.com/github/yannickwurm/sequenceserver)
[![gem version](https://badge.fury.io/rb/sequenceserver.svg)](http://rubygems.org/gems/sequenceserver)
[![total downloads](http://ruby-gem-downloads-badge.herokuapp.com/sequenceserver?type=total&color=brightgreen)](http://rubygems.org/gems/sequenceserver)

[![gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/yannickwurm/sequenceserver)

# SequenceServer - BLAST searching made easy!

SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user
interface for use locally or over the web.

## Installation

Please see http://www.sequenceserver.com.

## Contribute

You will need Ruby, NodeJS, respective package managers (RubyGems and npm), and
CodeClimate for development.

##### Get source code.
```
git clone https://github.com/yannickwurm/sequenceserver
cd sequenceserver
```

##### Install dependencies.
###### Ruby
```
gem install bundler && bundle
```

We use Capybara with WebKit driver for functional testing. If the above step
fails, install `qt` (On Mac: `brew install qt`) and run `bundle` again.

If you are deploying SequenceServer from git (not advised) you can skip
installing development dependencies (and `qt`) by running

    bundle install --without=development

###### Node
```
npm install
```

We use jspm for front-end package management.

#### Run, test, lint, build
```
# Launch SequenceServer in development mode.
bundle exec bin/sequenceserver -D

# Run tests, code linters, and build.
rake
```

## Contributors

* Anurag Priyam - [email](mailto:anurag08priyam@gmail.com) | [@yeban](//twitter.com/yeban)
* [Vivek Rai](http://vivekiitkgp.github.io/)
* Ben Woodcroft
* Yannick Wurm  - [http://wurmlab.github.io](http://wurmlab.github.io) |
  [@yannick__](//twitter.com/yannick__)
