

## getting  list of databases

    curl http://localhost:4567/searchdata.json | jq --raw-output '.database[].id'

gets  JSON like

  ```json

  {
  "query": null,
  "database": [
    {
      "name": "/db/cds+introns.fa",
      "title": "test",
      "type": "nucleotide",
      "nsequences": "6999",
      "ncharacters": "9589106",
      "updated_on": "Jun 15, 2020  7:36 PM\n",
      "id": "2f8c0e19d8d5b8ab225962d7284a6cbf"
    },
    {
      "name": "/db/pombe.fa",
      "title": "pombe2",
      "type": "nucleotide",
      "nsequences": "6999",
      "ncharacters": "9589106",
      "updated_on": "Jun 27, 2020  4:30 PM\n",
      "id": "3c0a5bc06f2596698f62c7ce87aeb62a"
    }
  ],
  "options": {
    "blastn": [
      "-task blastn",
      "-evalue 1e-5"
    ],
    "blastp": [
      "-evalue 1e-5"
    ],
    "blastx": [
      "-evalue 1e-5"
    ],
    "tblastx": [
      "-evalue 1e-5"
    ],
    "tblastn": [
      "-evalue 1e-5"
    ]
  }
}
```

### Submitting a query

To query a single database:

    curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAGGTCTGGCTAAAACCTT -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a http://localhost:4567

To query multiple databases, add extra -Fdatabases arguments, e.g.

    curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAGGTCTGGCTAAAACCTT -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a -Fdatabases[]=2f8c0e19d8d5b8ab225962d7284a6cbf http://localhost:4567


Or use -d syntax:
    curl -v -X POST -d 'sequence=ATGTTACCACCAACTATTAGAATTTCAGGTCTGGCTAAAACCTTACATATACCATCTAGA&databases%5B%5D=2f8c0e19d8d5b8ab225962d7284a6cbf&advanced=-task+blastn+-evalue+1e-6&method=blastn' http://localhost:4567

 curl -v -X POST -d 'sequence=ATGTTACCACCAACTATTAGAATTTCAGGTCTGGCTAAAACCTTACATATACCATCTAGA&databases%5B%5D=2f8c0e19d8d5b8ab225962d7284a6cbf&advanced=-task+blastn+-evalue+1e-6+-gapopen+4&method=blastn' http://localhost:
 
getting location header

    jobUrl=$(curl -v -X POST -Fsequence=ATGTTACCACCAACTATTAGAATTTCAGGTCTGGCTAAAACCTT -Fmethod=blastn -Fdatabases[]=3c0a5bc06f2596698f62c7ce87aeb62a --write-out '%{redirect_url}' http://localhost:4567)

and get the results 

    curl ${r}.json

### Results in other formats

The results are in json, but you can also get results in tabular or native XML

    /download/$jobId/.xml
    /download/$jobId/.std_tsv
    /download/$jobId/.full_tsv

### Downloading hits

    /get_sequence POST

comma separated lists of sequences and databases
curl -X POST -Fsequence_ids=SPAC1002.01,SPAC1002.02 -Fdatabase_ids=2f8c0e19d8d5b8ab225962d7284a6cbf  http://localhost:4567/get_sequence

