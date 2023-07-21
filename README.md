[![gem version](https://img.shields.io/badge/version-2.0-green.svg)](http://rubygems.org/gems/sequenceserver)
<!--[![total downloads](http://ruby-gem-downloads-badge.herokuapp.com/sequenceserver?type=total&color=brightgreen)](http://rubygems.org/gems/sequenceserver) -->
[![coverage](https://codeclimate.com/github/wurmlab/sequenceserver/badges/coverage.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)
[![build status](https://www.travis-ci.com/wurmlab/sequenceserver.svg?branch=master)](https://travis-ci.com/github/wurmlab/sequenceserver)
[![gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/wurmlab/sequenceserver)


<!--[![code climate](https://codeclimate.com/github/wurmlab/sequenceserver/badges/gpa.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)-->
<!--[![browser matrix](https://saucelabs.com/browser-matrix/yeban.svg)](https://saucelabs.com/u/yeban)-->

# SequenceServer - BLAST searching made easy!

SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user interface for personal or group use.

If you use SequenceServer, please cite:

> [Sequenceserver: A modern graphical user interface for custom BLAST
  databases. Molecular Biology and Evolution
  (2019).](https://doi.org/10.1093/molbev/msz185)


## Installation

For installation instructions and how to use SequenceServer please see
https://sequenceserver.com/

If you want to run SequenceServer directly from source code, please see
'Develop and contribute' section below.

## Release notes

New releases are announced on [GitHub release page](https://github.com/wurmlab/sequenceserver/releases) and on our [Support Page](https://support.sequenceserver.com).

## Reporting issues

Please report any issues here: https://github.com/wurmlab/sequenceserver/issues

## Develop and contribute

To develop and contribute, you will need to run SequenceServer from source (see below).

### Run SequenceServer from source code

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

### Run SequenceServer from Docker

Having [installed Docker](https://docs.docker.com/get-docker/), to run SequenceServer locally as a
Docker container, using the example database from the
[ncbi-blast+ debian package](https://packages.debian.org/sid/ncbi-blast+):

* Change `from final` at the end of the `Dockerfile` to `from dev`.
* Build the image with:
```bash
docker build -t sequenceserver .
```
* Run a container with...
```bash
docker run --rm -it -p 4567:4567 sequenceserver
```
* then select the defaults when prompted.

Otherwise, a database will need to be copied to the `db` volume.

### Making changes to the code

During development, you should use `-D` option to run SequenceServer in development mode. In this mode, SequenceServer will log verbosely.

    # Run SequenceServer in development mode
    bundle exec bin/sequenceserver -D

If you want to modify and build frontend code, you will additionally need [Node and npm](https://nodejs.org/). You can then run a watch server that will automatically build any changes you make the frontend code:

    # Install frontend dependencies
    npm install

    # Run watch server to automatically build changes to the frontend code
    npm run-script watch

Alternatively, you can manually build the frontend code after you have made your changes:

    # Build minified JS and CSS bundles
    npm run-script build

If you are using docker, you can build the frontend code and include it in the image by specifying '--target=minify' to the docker build command:

    docker build . -t seqserv-with-customisations --target=minify

## **Testing**

### **Ruby**

We use RSpec and Capybara for testing. Our test suite covers 87% of the codebase. Tests are run automatically when you open a pull-request (see Getting code merged section below) but it may be desirable sometimes to run a single test, whole file, or all tests locally:

To run a single test (a.k.a, scenario):

`bundle exec rspec spec/foo_spec.rb -e 'bar'`

To run all tests in a single file:

`bundle exec rspec spec/foo_spec.rb`

To run all tests:

`bundle exec rspec`

### **Javascript**

Unit tests for the React frontend are written using React Testing Library and jest. 

One option for installing jest: `npm install --save-dev jest`

To run a single test :

`npm run test -e "test name"`

To run all tests in a single file:

`npm run test file_name`

To run all tests:

`npm run test`


### Linting

We use CodeClimate for static code analysis. CodeClimate is run automatically when you open a pull-request (see Getting code merged section below) but it may be desirable sometimes to run it locally.

For this, first install CodeClimate following the instructions at https://github.com/codeclimate/codeclimate.

Once CodeClimate is installed, install the required codeclimate 'engines':

    codeclimate engines:install

To run all the style checkers:

    codeclimate analyze

To run eslint:

    codeclimate analyze -e eslint

To run rubocop:

    codeclimate analyze -e rubocop

stylelint is used for CSS:

    codeclimate analyze -e stylelint

The above commands respect the respective style checker's config files, e.g., .rubocopy.yml for Rubocop and so on.

### GitHub Workflows

To run workflows locally, ensure [nektos/act](https://github.com/nektos/act) is installed
as a [GitHub CLI extension](https://github.com/nektos/act#installation-as-github-cli-extension).

Then, for instance, `.github/workflows/test.yml` would be run by:

```
gh act -j test
```

[action-validator](https://github.com/mpalmer/action-validator) is claimed as a yaml validator for GitHub workflows.

### Getting code merged

Please open a pull-request on GitHub to get code merged. Our test suite and the CodeClimate static code analysis system will be automatically run on your pull-request. These should pass for your code to be merged. If you want to add a new feature to SequenceServer, please also add tests. In addition, code should be `rubocop` and `eslint` compliant, and hard-wrapped to 80 chars per line.

If you change frontend code (JavaScript and CSS), please build (i.e., minify and compress) and commit the resulting JS and CSS bundles before opening a pull-request. This is because SequenceServer is run in production mode by the test suite.

## Contact

* Anurag Priyam (architect) - [email](mailto:anurag08priyam@gmail.com) | [@yeban](//twitter.com/yeban)
* Yannick Wurm  (PI) - [email](mailto:yannickwurm@gmail.com) | [@yannick\_\_](//twitter.com/yannick__)
* [Mailing list / forum](https://support.sequenceserver.com)
