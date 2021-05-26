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

If you use SequenceServer, please cite:

> [Sequenceserver: A modern graphical user interface for custom BLAST
  databases. Molecular Biology and Evolution
  (2019).](https://doi.org/10.1093/molbev/msz185)


## Stable (version 1.0.11)

- Release date: June 2017
- Works with BLAST 2.2.30

### Installation

For installation instructions and how to use SequenceServer please see
https://sequenceserver.com/#installation.

If you want to run SequenceServer directly from source code, please see
'Develop and contribute' section below.

## Beta (version 2.0)

SequenceServer 2.0 includes three new visualisations to help interpret BLAST results, enables sharing of BLAST results and visualising of externally generated BLAST XML file (including from DIAMOND), removes the 30 hit limit for FASTA download and adds ability to download pairwise alignment, is better equipped to handle long-running BLAST jobs and rendering of large search results (thousands of hits), supports BLAST 2.10.0+ and the new database format (including migrating your old databases to the new format), contains additional hooks for integrating as part of other websites and several other enhancements under the hood.

Read more about SequenceServer 2.0 and extensive testing of the candidate releases by the community: https://groups.google.com/d/msg/sequenceserver/c98ePBzcuVE/lN-S35jVHgAJ.

New candidate releases are announced on [GitHub release page](https://github.com/wurmlab/sequenceserver/releases) and on [Google Group](https://groups.google.com/forum/#!forum/sequenceserver/), while our [GitHub project board](https://github.com/wurmlab/sequenceserver/projects/3) provides an overview of what remains to migrate from candidate to stable release.

We invite you to try out the latest candidate release and help us out by reporting any issues you may encounter with your setup (instructions below).

### Install and configure

To get the latest 2.0 (beta) release, run:

    gem install --pre sequenceserver

If you are new to the above command, please consult the 'Install or update'
section on our website http://sequenceserver.com.

If you want to run SequenceServer beta directly from source code, please see
'Develop and contribute' section below.

### Reporting issues

Please report any issues here: https://github.com/wurmlab/sequenceserver/issues

### Develop and contribute

To develop and contribute, you will need to run SequenceServer from source.

#### Run SequenceServer from source code

You will need [Ruby](https://www.ruby-lang.org/en/) and [RubyGems](https://rubygems.org/):

    # Install bundler gem to install Ruby dependencies
    gem install bundler

    # Move to where you downloaded or cloned seqserv
    cd sequenceserver

    # Use bundler to install Ruby dependencies
    bundle install

    # Use bundler to run SequenceServer
    bundle exec bin/sequenceserver


If you do not plan to develop, you can skip installing development dependencies
by running `bundle install --without=development`.

#### Making changes to the code

During development, you should use `-D` option to run SequenceServer in development mode. In this mode, SequenceServer logs verbosely and uses raw front-end files.

    # Run SequenceServer in development mode
    bundle exec bin/sequenceserver -D

You will need [Node and npm](https://nodejs.org/) if you want to modify and build frontend code:

    # Install frontend dependencies
    npm install

    # Build minified JS and CSS bundles
    npm run-script build

Or if you are using docker, you can build the frontend code and include it in the image by specifying '--target=minify' to the docker build command:

    docker build . -t seqserv-with-customisations --target=minify

#### Testing

We use RSpec and Capybara for testing. Our test suite covers 87% of the codebase. Running all tests can take considerable time (~2 hrs). We recommend using Travis to automatically run all tests when you push your code to your fork. Tests are also run automatically when you open a pull-request (see Getting code merged section below). Although, it may be desirable sometimes to run a single test, whole file, or all tests locally:

To run a single test (a.k.a, scenario):

    bundle exec rspec spec/foo_spec.rb -e 'bar'

To run all tests in a single file:

    bundle exec rspec spec/foo_spec.rb

To run all tests:

    bundle exec rspec

#### Getting code merged

Please open a pull-request on GitHub to get code merged. Our test suite and the CodeClimate static code analysis system will be automatically run on your pull-request. These should pass for your code to be merged. If you want to add a new feature to SequenceServer, please also add tests. In addition, code should be `rubocop` and `eslint` compliant, and hard-wrapped to 80 chars per line.

If you change frontend code (JavaScript and CSS), please build (i.e., minify and compress) and commit the resulting JS and CSS bundles before opening a pull-request. This is because SequenceServer is run in production mode by the test suite.

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
