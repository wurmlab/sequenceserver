ARG BLAST_VERSION=2.10.0

FROM ruby:2.7-slim-buster AS builder

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool"
LABEL MailingList="https://groups.google.com/forum/#!forum/sequenceserver"
LABEL Website="http://www.sequenceserver.com"

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc make patch && rm -rf /var/lib/apt/lists/*

WORKDIR /sequenceserver
COPY ./lib/sequenceserver/version.rb lib/sequenceserver/version.rb
COPY ./Gemfile ./Gemfile.lock ./sequenceserver.gemspec .

RUN bundle install --without=development

FROM ncbi/blast:${BLAST_VERSION} AS ncbi-blast
FROM ruby:2.7-slim-buster
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libgomp1 liblmdb0 && rm -rf /var/lib/apt/lists/* 

RUN mkdir -p ~/.sequenceserver && \
    touch ~/.sequenceserver/asked_to_join

COPY --from=ncbi-blast /blast/lib /blast/lib/
COPY --from=ncbi-blast /blast/bin/blast_formatter /blast/bin/
COPY --from=ncbi-blast /blast/bin/blastdbcmd /blast/bin/
COPY --from=ncbi-blast /blast/bin/blastn.REAL /blast/bin/blastn
COPY --from=ncbi-blast /blast/bin/blastp.REAL /blast/bin/blastp
COPY --from=ncbi-blast /blast/bin/blastx.REAL /blast/bin/blastx
COPY --from=ncbi-blast /blast/bin/makeblastdb /blast/bin
COPY --from=ncbi-blast /blast/bin/tblastn.REAL /blast/bin/tblastn
COPY --from=ncbi-blast /blast/bin/tblastx.REAL /blast/bin/tblastx
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/

WORKDIR /sequenceserver

COPY . .

ENV PATH=/blast/bin:${PATH}
VOLUME ["/db"]
EXPOSE 4567

CMD ["bundle", "exec", "bin/sequenceserver", "-d", "/db"]
