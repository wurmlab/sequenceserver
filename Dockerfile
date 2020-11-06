# Build variables. These need to be declared befored the first FROM
# for the variables to be accessible in FROM instruction.
ARG BLAST_VERSION=2.10.0

## Stage 1: gem dependencies.
FROM ruby:2.7-slim-buster AS builder

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
FROM ncbi/blast:${BLAST_VERSION} AS ncbi-blast


## Stage 3: Puting it together.
FROM ruby:2.7-slim-buster

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool"
LABEL MailingList="https://groups.google.com/forum/#!forum/sequenceserver"
LABEL Website="http://sequenceserver.com"

# Install packages required to run SequenceServer and BLAST.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libgomp1 liblmdb0 && rm -rf /var/lib/apt/lists/*

# Copy gem dependencies and BLAST+ binaries from previous build stages.
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/
COPY --from=ncbi-blast /blast/lib /blast/lib/
COPY --from=ncbi-blast /blast/bin/blast_formatter /blast/bin/
COPY --from=ncbi-blast /blast/bin/blastdbcmd /blast/bin/
COPY --from=ncbi-blast /blast/bin/blastn.REAL /blast/bin/blastn
COPY --from=ncbi-blast /blast/bin/blastp.REAL /blast/bin/blastp
COPY --from=ncbi-blast /blast/bin/blastx.REAL /blast/bin/blastx
COPY --from=ncbi-blast /blast/bin/makeblastdb /blast/bin
COPY --from=ncbi-blast /blast/bin/tblastn.REAL /blast/bin/tblastn
COPY --from=ncbi-blast /blast/bin/tblastx.REAL /blast/bin/tblastx

# Add BLAST+ binaries to PATH.
ENV PATH=/blast/bin:${PATH}

# Setup working directory, volume for databases, port, and copy the code.
# SequenceServer code.
WORKDIR /sequenceserver
VOLUME ["/db"]
EXPOSE 4567
COPY . .

# Prevent SequenceServer from prompting user to join announcements list.
RUN mkdir -p ~/.sequenceserver && touch ~/.sequenceserver/asked_to_join

CMD ["bundle", "exec", "bin/sequenceserver", "-d", "/db"]
