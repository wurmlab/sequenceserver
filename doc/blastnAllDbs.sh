#!/bin/bash

###################################################
# This script exemplifies use of SequenceServer API to submit a blastn job,
# wait for the results to be ready, download them and generate links
# to download in other formats, and to download hits.
#
# It requires only 'curl' and 'jq' to be installed
#
# The script does not have full error-handling, so needs more resilience
# mechanisms for production use.
#
# Usage: $0 <queryDNA>
###################################################

# Change this to the URL of your instance
BASE_URL=http://localhost:4567
## a DNA sequence
query=$1

## Queries job  for results. Takes 2 arguments
# @param the URL of the job (with .json suffix)
# @paran the name of an outfile
## echoes the HTTP response code 
function queryJob {
  url=$1
  outfile=$2
  httpCode=$(curl -o $outfile --write-out '%{response_code}' $url)
  echo "$httpCode" 
}

## get all database ids as array
databaseIds=($(curl $BASE_URL/searchdata.json | jq --raw-output '.database[].id'))

curlCommandArgs="-Fmethod=blastn -Fsequence=$query"

## add all database Ids as form params
for item in ${databaseIds[*]};
   do curlCommandArgs="$curlCommandArgs -Fdatabases[]=$item";
done

jobUrl=$(curl -X POST $curlCommandArgs --write-out '%{redirect_url}' $BASE_URL)
echo "Job URL is:  ${jobUrl}.json"

## generate an outfile name based on timestamp.
ts=$(date +%Y-%m-%d:%H:%M:%S)
outfileName=$ts.json

## query job status till get a 200 response.
status=$(queryJob $jobUrl.json $outfileName)
while [[ "$status" -eq "202" ]]; do
    echo "status is 202, waiting 5s"
    sleep 5
    status=$(queryJob $jobUrl.json $outfileName)
done

if [[ "$status" -eq "200" ]]; then
    echo "Finished, results are in $outfileName"

    ## extract jobID from the job URL
    jid=$(echo $jobUrl | awk -F / '{print $NF'} | awk -F . '{print $1}')
    printf "%-35s %s\n" "Get results as XML:" "curl $BASE_URL/download/$jid.xml"
    printf "%-35s %s\n" "Get results as Standard tabular:" "curl $BASE_URL/download/$jid.std_tsv"
    printf "%-35s %s\n" "Get results as Full Tabular:" "curl $BASE_URL/download/$jid.full_tsv"
    
    ## get the ids of hits to generate sequence retrieval link
    hitIds=($(cat $outfileName | jq --raw-output '.queries[].hits[].id'))
    dbIds=($(cat $outfileName | jq --raw-output '.querydb[].id'))

    hitArgs="-Fsequence_ids="
    for hit in ${hitIds[*]}; do
        hitArgs="${hitArgs}${hit},"
    done

    dbArgs="-Fdatabase_ids="
    for hit in ${dbIds[*]}; do
        dbArgs="${dbArgs}${hit},"
    done

    printf "%-35s %s\n" "Download hits:" "curl -X POST $hitArgs $dbArgs $BASE_URL/get_sequence"
else
    echo "Finished with status code $status"
fi