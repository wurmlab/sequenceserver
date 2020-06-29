---
--- 
## Sequence Server API

This document describes how to access SequenceServer functionality 
programmatically using the command line.

The documentation is based on version 2.0.0.rc4

Example invocations use `curl` and `jq`. 

`$BASEURL` in the examples is the URL of your SequenceServer instance. E.g. http://localhost:4567 if you are running on default localhost URL. 

The accompanying script [blastnAllDbs.sh](./blastnAllDbs.sh) is a working shell script to submit a BLAST job and get results.

## Getting  list of databases

    GET: /searchdata.json

In order to submit a Blast job, you have to know the IDs of the Blast databases. This endpoint retrieves information about the databases in JSON format.

    curl $BASEURL/searchdata.json | jq --raw-output '.database[].id'

The above command gets the IDs of the databases

## Submitting a query

POST: /

### Form parameters

* `method`. The name of the blast search to use (blastn, blastp, tblastn etc)
* `sequence` The query sequence
* `databases[]` One or more Ids of Blast databases to search
* `advanced` Additional options, e.g evalue, gapopen, gapextend etc

### Responses

Successful submission results in a 303 HTTP status code.

* Code 303
* `Location` header is a link to the submitted job ID
     
### Examples

1. To query a single database using blastn:

    curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAG -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a $BASEURL

2. To query multiple databases, add extra -Fdatabases[] arguments, e.g.


    curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAG -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a -Fdatabases[]=2f8c0e19d8d5b8ab225962d7284a6cbf $BASEURL

3. Getting location header - you need this in order to retrieve the results

    jobUrl=$(curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAG -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a \-\-write-out \'%{redirect_url}\' $BASEURL)

4. Altering the evalue threshold and adding a gap penalty:

    curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAG -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a  -Fadvanced=\"-evalue 1.0e-8 -gapopen 1 -gapextend 1\" $BASEURL

## Retrieving results

GET: /{jobId}.json

### Path variables

* `jobId` The Job Id

### Responses

* Code: 202 The Blast job is still running
* Code: 200 The job is complete, results are in JSON format

### Examples

    curl -o myresults.json $BASEURL/069b56c8-25bd-451e-b117-dc996a1aed24.json

## Results in other formats

GET: /download/{jobId}.{format}

### Path variables

* `jobId` the Job ID retrieved after submission
* `format` is one of `xml`, `std_tsv` or `full_tsv`

### Examples

    curl -o myresults.xml $BASEURL/download/069b56c8-25bd-451e-b117-dc996a1aed24.xml
    curl -o myresults.tsv $BASEURL/download/069b56c8-25bd-451e-b117-dc996a1aed24.std_tsv
    curl -o myresults-full.tsv $BASEURL/download/069b56c8-25bd-451e-b117-dc996a1aed24.full_tsv

## Downloading hits

Download hits in FASTA format.

POST:  /get_sequence

### Form parameters

* `sequence_ids` A comma-separated list of sequence IDs
* `database_ids` A comma-separated list of database Ids

### Examples
    
    curl -X POST -Fsequence_ids=SPAC1002.01,SPAC1002.02 -Fdatabase_ids=2f8c0e19d8d5b8ab225962d7284a6cbf  $BASEURL/get_sequence
