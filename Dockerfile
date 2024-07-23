# Build variables. These need to be declared befored the first FROM
# for the variables to be accessible in FROM instruction.
ARG BLAST_VERSION=2.16.0

## Stage 1: gem dependencies.
FROM docker.io/library/ruby:3.2-bookworm AS builder

# Copy over files required for installing gem dependencies.
WORKDIR /sequenceserver
COPY Gemfile Gemfile.lock sequenceserver.gemspec ./
COPY lib/sequenceserver/version.rb lib/sequenceserver/version.rb

# Install packages required for building gems with C extensions.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc make patch && rm -rf /var/lib/apt/lists/*

# Install gem dependencies using bundler.
RUN bundle install --without=development

## Stage 2: BLAST+ binaries.
# We will copy them from NCBI's docker image.
FROM docker.io/ncbi/blast-static:${BLAST_VERSION} AS ncbi-blast

## Stage 3: Puting it together.
FROM docker.io/library/ruby:3.2-bookworm AS final

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool"
LABEL MailingList="https://groups.google.com/forum/#!forum/sequenceserver"
LABEL Website="http://sequenceserver.com"

# Install packages required to run SequenceServer and BLAST.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libgomp1 && rm -rf /var/lib/apt/lists/*

# Copy gem dependencies and BLAST+ binaries from previous build stages.
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/
COPY --from=ncbi-blast \
  /blast/bin/blast_formatter \
  /blast/bin/blastdbcmd \
  /blast/bin/blastn \
  /blast/bin/blastp \
  /blast/bin/blastx \
  /blast/bin/makeblastdb \
  /blast/bin/tblastn \
  /blast/bin/tblastx \
  /blast/bin/

# Add BLAST+ binaries to PATH.
ENV PATH=/blast/bin:${PATH}

# Setup working directory, volume for databases, port, and copy the code.
# SequenceServer code.
WORKDIR /sequenceserver
RUN mkdir /db
EXPOSE 4567
COPY . .

# Generate config file with default configs and database directory set to /db.
# Setting database directory in config file means users can pass command line
# arguments to SequenceServer without having to specify -d option again.
RUN mkdir -p /db && echo 'n' | script -qfec "bundle exec bin/sequenceserver -s -d /db" /dev/null

# Prevent SequenceServer from prompting user to join announcements list.
RUN mkdir -p ~/.sequenceserver && touch ~/.sequenceserver/asked_to_join

# Add SequenceServer's bin directory to PATH and set ENTRYPOINT to
# 'bundle exec'. Combined, this simplifies passing command-line
# arguments to SequenceServer, while retaining the ability to run
# bash in the container.
ENV PATH=/sequenceserver/bin:${PATH}
ENTRYPOINT ["bundle", "exec"]
CMD ["sequenceserver"]

## Stage 4 (optional) minify CSS & JS.
FROM node:20-alpine AS node

RUN apk add --no-cache git
WORKDIR /usr/src/app
COPY ./package.json ./package-lock.json ./webpack.config.js ./babel.config.js ./
RUN npm install
ENV PATH=${PWD}/node_modules/.bin:${PATH}
COPY public public
RUN npm run-script build

## Stage 5 (optional) minify
FROM final AS minify

COPY --from=node /usr/src/app/public/sequenceserver-*.min.js public/
COPY --from=node /usr/src/app/public/css/sequenceserver.min.css public/css/

## Stage 6 (optional) Pull the example database from the debian package.
FROM docker.io/library/ruby:3.2-bookworm AS example_db

WORKDIR /tmp
RUN apt-get update && apt-get download ncbi-blast+ && dpkg-deb -xv ncbi-blast+*.deb .

FROM final AS dev

RUN bundle install

COPY --from=example_db /tmp/usr/share/doc/ncbi-blast+/examples /db/

VOLUME ["/db"]

FROM final

VOLUME ["/db"]
