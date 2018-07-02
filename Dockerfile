FROM debian:stretch-backports

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool"
LABEL MailingList="https://groups.google.com/forum/#!forum/sequenceserver"
LABEL Website="http://www.sequenceserver.com"
LABEL Version="1.1.0 beta"

RUN apt-get update  && apt-get install -y --no-install-recommends \
        build-essential \
        ruby ruby-dev \
        curl wget \
        gnupg \
        git \
        ncbi-blast+ \
        zlib1g-dev

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
        apt-get update  && apt-get install -y --no-install-recommends \
        nodejs npm && \
        rm -rf /var/lib/apt/lists/*

VOLUME ["/db"]
EXPOSE 4567

COPY . /sequenceserver
WORKDIR /sequenceserver
RUN gem install bundler && bundle && npm install
ENTRYPOINT ["bundle", "exec", "bin/sequenceserver", "-d", "/db"]
