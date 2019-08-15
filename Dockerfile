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
        zlib1g-dev

VOLUME ["/db"]
EXPOSE 4567

COPY . /sequenceserver
WORKDIR /sequenceserver
RUN gem install bundler && bundle install --without=development
RUN yes '' | bundle exec bin/sequenceserver -s
ENTRYPOINT ["bundle", "exec", "bin/sequenceserver", "-d", "/db"]
