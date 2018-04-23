[![build status](https://secure.travis-ci.org/wurmlab/sequenceserver.png)](https://travis-ci.org/wurmlab/sequenceserver)
[![code climate](https://codeclimate.com/github/wurmlab/sequenceserver/badges/gpa.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)
[![coverage](https://codeclimate.com/github/wurmlab/sequenceserver/badges/coverage.svg)](https://codeclimate.com/github/wurmlab/sequenceserver)
[![gem version](https://badge.fury.io/rb/sequenceserver.svg)](http://rubygems.org/gems/sequenceserver)
[![total downloads](http://ruby-gem-downloads-badge.herokuapp.com/sequenceserver?type=total&color=brightgreen)](http://rubygems.org/gems/sequenceserver)

[![gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/wurmlab/sequenceserver)

[![browser matrix](https://saucelabs.com/browser-matrix/yeban.svg)](https://saucelabs.com/u/yeban)

# SequenceServer - BLAST searching made easy!

SequenceServer lets you rapidly set up a BLAST+ server with an intuitive user
interface for use locally or over the web.

> Please cite: [Priyam A, Woodcroft BJ, Rai V, Munagala A, Moghul I, Ter F, Gibbins MA, Moon H, Leonard G, Rumpf W & Wurm Y. 2015. Sequenceserver: A modern graphical user interface for custom BLAST databases. biorxiv doi: 10.1101/033142](http://www.biorxiv.org/content/early/2015/11/27/033142).

## Install and configure

Please see http://sequenceserver.com.

## Develop and contribute

You will need Ruby and RubyGems, Node and npm, and CodeClimate. Further, please
note that **`1.0.x` branch contains the stable releases, while the `master`
branch is a work in progress towards next release and may be buggy**.

### Setup
Get source code and install dependencies.

```
git clone https://github.com/wurmlab/sequenceserver
gem install bundler
cd sequenceserver
npm install
bundle
```

If you are deploying SequenceServer from git you can skip `npm install` step
and skip installing gems used for testing (and `qt`), etc. by running:

    bundle install --without=development

### Run, test, build

Launch SequenceServer in development mode. In development mode SequenceServer
logs verbosely and uses raw front-end files.
```
bundle exec bin/sequenceserver -D
```

Run tests:
```
bundle exec rspec
```

Run code style checkers (rubocop, csslint, eslint) -
```
codeclimate analyze
```

Build minifies JS and CSS bundles:
```
npm run-script build
```

## Using Docker
```bash
# With database fasta files inside a folder named db
docker run --rm -ti -p 4567:4567 -v $(pwd)/db:/db wurmlab/sequenceserver
```

## Contact

* Anurag Priyam (architect) - [email](mailto:anurag08priyam@gmail.com) | [@yeban](//twitter.com/yeban)
* Yannick Wurm  (PI) - [email](mailto:yannickwurm@gmail.com) | [@yannick\_\_](//twitter.com/yannick__)
* [Mailing list / forum](https://groups.google.com/forum/#!forum/sequenceserver)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
