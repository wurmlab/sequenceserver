# SequenceServer
#
# Intuitive local web frontend for the BLAST bioinformatics tool http://www.sequenceserver.com
#
# Contact:
#   Anurag Priyam (architect) <anurag08priyam@gmail.com> <twitter.com/yeban>
#   Yannick Wurm  (PI) <yannickwurm@gmail.com> <twitter.com/yannick__>
#   Mailing list / forum <https://groups.google.com/forum/#!forum/sequenceserver>
#
# VERSION 1.0.0

FROM ubuntu:16.04
MAINTAINER Bruno Vieira <mail@bmpvieira.com>

LABEL Description="Intuitive local web frontend for the BLAST bioinformatics tool http://www.sequenceserver.com" Version="1.0.0"

RUN apt-get update
RUN apt-get install -y build-essential ruby ruby-dev ncbi-blast+
RUN gem install sequenceserver
CMD sequenceserver -d /db
