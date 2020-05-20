FROM debian:buster-slim

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool"
LABEL MailingList="https://groups.google.com/forum/#!forum/sequenceserver"
LABEL Website="http://www.sequenceserver.com"

RUN apt-get update && apt-get install -y --no-install-recommends \
        ruby ruby-dev build-essential curl gnupg git wget \
        zlib1g-dev && rm -rf /var/lib/apt/lists/*

VOLUME ["/db"]
EXPOSE 4567

COPY . /sequenceserver
WORKDIR /sequenceserver
# Install bundler, then use bundler to install SequenceServer's dependencies,
# and then use SequenceServer to install BLAST. In the last step, -s is used
# so that SequenceServer will exit after writing configuration file instead
# of starting up, while -d is used to suppress questions about database dir.
RUN gem install bundler && \
        bundle install --without=development && \
        yes '' | bundle exec bin/sequenceserver -s -d spec/database/sample
RUN touch ~/.sequenceserver/asked_to_join

CMD ["bundle", "exec", "bin/sequenceserver", "-d", "/db"]
