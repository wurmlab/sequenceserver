#/bin/bash

docker container create \
	--name sequenceserver \
	--mount type=bind,source=/opt/sequenceserver/configs/sequenceserver.conf,target=/root/.sequenceserver.conf,readonly \
	--mount type=bind,source=/opt/sequenceserver/configs/aws/credentials,target=/root/.aws/credentials,readonly \
	--mount type=bind,source=/opt/sequenceserver/configs/ssh,target=/root/.ssh,readonly \
	--mount type=bind,source=/opt/sequenceserver/patches/blast,target=/blast/bin,readonly \
	--mount type=bind,source=/mnt/blast,target=/root/.sequenceserver \
	--add-host "www.ncbi.nlm.nih.gov:127.0.0.1" \
	-p 4567:4567 \
	sequenceserver:latest \
	sequenceserver -D
