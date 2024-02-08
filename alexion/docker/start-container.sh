#/bin/bash

docker start sequenceserver \
	&& docker logs --follow sequenceserver
