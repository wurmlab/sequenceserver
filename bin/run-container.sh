#/bin/bash

docker run --rm -it \
        --mount type=bind,source=/opt/sequenceserver/configs/sequenceserver.conf,target=/root/.sequenceserver.conf,readonly \
        --mount type=bind,source=/opt/sequenceserver/configs/aws/credentials,target=/root/.aws/credentials,readonly \
        --mount type=bind,source=/opt/sequenceserver/configs/ssh,target=/root/.ssh,readonly \
        --mount type=bind,source=/opt/sequenceserver/tmp/output,target=/root/.sequenceserver \
        --mount type=bind,source=/opt/sequenceserver/patches/blast,target=/blast/bin,readonly \
        --mount type=bind,source=/mnt/blast,target=/db,readonly \
	--add-host "www.ncbi.nlm.nih.gov:127.0.0.1" \
	-p 4568:4567 \
	--entrypoint "/bin/bash" \
	sequenceserver:debug \
	"${@}"

# docker run --rm -it \
# 	-v /opt/sequenceserver/configs/sequenceserver.conf:/root/.sequenceserver.conf:ro \
# 	-v /opt/sequenceserver/configs/aws/credentials:/root/.aws/credentials:ro \
# 	-v /opt/sequenceserver/configs/ssh:/root/.ssh:ro \
# 	-v /opt/sequenceserver/tmp/output:/root/.sequenceserver \
# 	-v /opt/sequenceserver/patches/blast:/blast/bin:ro \
# 	-v /mnt/blast:/db:ro \
# 	-p 4568:4567 \
# 	--entrypoint "/bin/bash" \
# 	sequenceserver:debug \
# 	"${@}"
