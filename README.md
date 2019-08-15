[![gem version](https://img.shields.io/badge/version-1.0.x%20(old%20stable)-green.svg)](http://rubygems.org/gems/sequenceserver)
[![build status](https://secure.travis-ci.org/wurmlab/sequenceserver.png?branch=1.0.x)](https://travis-ci.org/wurmlab/sequenceserver)
[![total downloads](http://ruby-gem-downloads-badge.herokuapp.com/sequenceserver?type=total&color=brightgreen)](http://rubygems.org/gems/sequenceserver)
[![gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/wurmlab/sequenceserver)

**Beta version:** 
[![new gem version](https://img.shields.io/badge/version-2.0%20(beta)-yellowgreen.svg)](http://rubygems.org/gems/sequenceserver) **GitHub Master:** [![build status](https://secure.travis-ci.org/wurmlab/sequenceserver.png)](https://travis-ci.org/wurmlab/sequenceserver)




<!--[![code climate](https://codeclimate.com/github/wurmlab/sequenceserver/badges/gpa.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)-->
<!--[![coverage](https://codeclimate.com/github/wurmlab/sequenceserver/badges/coverage.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)-->
<!--[![browser matrix](https://saucelabs.com/browser-matrix/yeban.svg)](https://saucelabs.com/u/yeban)-->

# SequenceServer - BLAST searching made easy!

SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user interface for personal or group use.

## Version 1.0.11

- Stable release
- Release date: June 2017
- Works with BLAST 2.2.30

For installation instructions and how to use SequenceServer please see
http://sequenceserver.com.

If you want to install and use SequenceServer from source, we recommend the
use of 'bundler' Ruby gem to install dependencies and to run SequenceServer:

    # Install bundler gem
    gem install bundler

    # Use bundler to install dependencies
    cd sequenceserver
    bundle install --without=development

    # Use bundler command to run SequenceServer
    bundle exec bin/sequenceserver

If you use SequenceServer, please cite:

> [Sequenceserver: A modern graphical user interface for custom BLAST
  databases. Molecular Biology and Evolution
  (2019).](https://doi.org/10.1093/molbev/msz185)

## Version 2.0 (beta)

Beta release of SequenceServer version 2.0.

Here, we have changed the underlying architecture to persist jobs so that
the results can be bookmarked or shared, and to support integration with
grid engines such as qsub. Furthermore, the HTML report is now generated
in the browser by fetching BLAST results in JSON format from the server.
This facilitates the use of existing JavaScript libraries to visualise
BLAST results.

The new beta releases are announced on [Google Group](https://groups.google.com/forum/#!forum/sequenceserver) and on the [GitHub release page](https://github.com/wurmlab/sequenceserver/releases).

### Install and configure

To get the latest 2.0 (beta) release, run:

    gem install --pre sequenceserver

If you are new to the above command, please consult the 'Install or update'
section on our website http://sequenceserver.com.

If you want to install and use the beta versions from source, the process
is the same as for the old stable release (instructions above).

### Develop and contribute

In addition to [Ruby](https://www.ruby-lang.org/en/) and [RubyGems](https://rubygems.org/), you will need [Node and npm](https://nodejs.org/) if you want to build JavaScript assets, and [CodeClimate](https://codeclimate.com/) to run static code analysis.

If you want to submit a pull-request, you don't need to build JavaScript assets
(we will do it) or to have run CodeClimate.

To develop and contribute, you will need to run SequenceServer from source (see
previous section).

#### Workflow commands

Launch SequenceServer in development mode. In development mode SequenceServer
logs verbosely and uses raw front-end files.

    bundle exec bin/sequenceserver -D

Run tests:

    bundle exec rspec

Run code style checkers (rubocop, csslint, eslint) -

    codeclimate analyze

To install JS dependencies to be build JS and CSS bundles:

    npm install

Build minified JS and CSS bundles:

    npm run-script build

## Docker builds

Both the old stable and new beta versions of SequenceServer are available as
Docker images.

```
# With database fasta files inside a folder named db
docker run --rm -ti -p 4567:4567 -v $(pwd)/db:/db wurmlab/sequenceserver
```

This will use the new beta release of SequenceServer. To use the old stable
release, add the version tag to the command:

```
# With database fasta files inside a folder named db
docker run --rm -ti -p 4567:4567 -v $(pwd)/db:/db wurmlab/sequenceserver:1.0.11
```

## Contact

* Anurag Priyam (architect) - [email](mailto:anurag08priyam@gmail.com) | [@yeban](//twitter.com/yeban)
* Yannick Wurm  (PI) - [email](mailto:yannickwurm@gmail.com) | [@yannick\_\_](//twitter.com/yannick__)
* [Mailing list / forum](https://groups.google.com/forum/#!forum/sequenceserver)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
