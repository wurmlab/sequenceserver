---
title: "SequenceServer BLAST release notes"
date:   2021-08-01 23:03:32"
layout: page
---

# Release notes during the development of Sequenceserver BLAST


## 2020-12-11 Many improvements due to Hacktoberfest and other initiatives

We are pleased to announce the next candidate release of SequenceServer 2.0.

1. Automatically check for incompatible databases on startup and prompt users to reformat them.
2. Upgrading from the older (V4) to the newer (V5) database now preserves any taxonomy information embedded in the database.
3. Add ability to use -taxids_map of makeblastdb during database creation. To use it, add a '.taxids_map.txt' file next to the FASTA file (e.g. "/db/ants.taxids_map.txt" for "/db/ants.fa")
4. Add option in the search form to open BLAST results in a new tab.
5. Add 'Edit search' and 'New search' links to the report page. (thanks to Tomas-Pluskal & TomMD for the push)
6. Search form can now be cleared by reloading the page. Relevant if you use your web browser's back button or 'Edit search' link and want to clear the form to start over.
7. Make it easier to pass command line arguments to Docker image. For example, number of BLAST threads can now be set as "docker run ... wurmlab/sequenceserver sequenceserver -n 4" instead of "docker run ... wurmlab/sequenceserver bundle exec bin/sequenceserver -d /db -n4" (yeah!)
8. Reduce size of Docker image 3-fold. (credit: Nathan Weeks, Neel Kamath)
9. Reduce size of gem file 3-fold. (credit: Nathan Weeks)
10. Fix a bug that prevented query textarea from being resized veritcally. (credit: Iain-S)
11. Fix a bug that prevented search form from rendering query sequences sent to it via POST request. (credit: Sam Hokin)
12. Fix a bug that prevented the use of keyboard shortcut 'Ctrl-Enter' to submit the search form.
13. Fix a bug that would cause an infinite loop on search form if the user had only one database.
14. Fix a bug that could cause new users to be prompted more than once to join the announcements list.
15. Fix a bug that was causing Travis builds to fail.

Special thanks to [Iain-S](https://github.com/iain-s) for introducing us to [hacktoberfest](https://github.com/topics/hacktoberfest). It was incredibly productive, leading to changes 8-10 above.


## 2020-06-23 Support for NCBI BLAST's v5 database format

Based on your feedback we have fixed bugs affecting docker and sub-URI deployments, updated documentation for HPC-integration, and most importantly, we have created a path for migrating to NCBI’s newer V5 database format (see release notes below).

1. Running 'sequenceserver -m' will now automatically detect older V4 databases, and those created without the '-parse_seqids' option of makeblastdb, and offer to rebuild them. This works even if you deleted the original FASTA files. Database titles are preserved when rebuilding, however, taxonomy information in the database is unfortunately not preserved.
2. If you do not wish to rebuild your databases yet, you can now run SequenceServer with BLAST+ 2.9.0 instead. The tradeoff is that you would have to manually download BLAST+ 2.9.0 and indicate its location in the configuration file. SequenceServer will only download 2.10 by default.
3. If building BLAST databases fails for some reason, the command that was tried and the resulting output is properly relayed to the user so that the problem can be diagnosed (#469). Thanks to mjcoynejr for testing the fix.
4. BLASTing a mix of older V4 and newer V5 databases causes error. SequenceServer now catches and informs the user of this error. Thanks to Massimiliano babbucci for reporting this issue.
5. On sub-URI deployments, clicking the back button would result in no databases to be displayed in the search form (#462). Fixed that. Thanks to Xiang Zhang for reporting the issue and testing the fix.
6. The list of databases in the search form should be alphabetically sorted. This behaviour was lost in the rewrite leading to version 2.0 and has now been fixed. Thanks to Loraine Guéguen for reporting the issue.
7. Docker-related optimisations: SequenceServer no longer prompts to join the mailing list when running under Docker (#468). Thanks to Matt for reporting the issue. Furthermore, we have updated the docker base image and reduced the image size by ~100 Mb.
8. Documentation for HPC integration was out of date with regard to how to invoke the wrapper script (#445). Thanks to Loraine Guéguen for reporting the issue, testing the fix.

Thanks to Niek Art, Matt Yoder, Massimiliano babbucci, Bjoernsen, and Eric Y for reporting database compatibility issues that prompted us to create a path for migrating to the new database format.


## 2020-04-22 Release candidate 2

1. A programming error prevented databases from being deselected when you go back to the search form after submitting a query. That's now fixed. Thanks to Norman Johnson for reporting the issue.
2. Database creation step could skip FASTA files containing too many Ns at the beginning of the file. Fixed that. Thanks to Michał T. Lorenc for reporting the issue.
3. During the initial setup SequenceServer would print the message 'config file not found' multiple times. Fixed that.
4. Results page would fail to load completely if the submitted queries resulted in no hits. Fixed that.
5. Give users an option to sign up for release and other important announcements during the initial setup.
6. Highlight the use of non-default parameters by changing the background of advanced parameters field to yellow when filled.
7. Include SequenceServer version and a link to our paper in the search summary at the top of the results page.

### New documentation

We have also been able to make many of the required changes to the website for the 2.0 release and are testing it locally: https://github.com/wurmlab/sequenceserver/tree/gh-pages2.0. 




## 2020-03-15 New architecture for improved flexibility: 2.0 release candidate 1

Dear colleagues,

We are pleased to announce a candidate release of SequenceServer 2.0. This completes the rearchitecting of SequenceServer 1.0 that we announced almost two years ago: https://groups.google.com/d/msg/sequenceserver/2G4_jdAr4-k/2yxQKixVBQAJ

We have made many changes since version 1.0. The key features are:
1. Support for BLAST 2.10.0 and the new BLAST database format.
2. Results now open in a new page. You can share the link with colleagues or bookmark the page and return to it at a later date. Results are saved for 30 days.
3. We have integrated three new visualisations that facilitate interpretation of BLAST results:
Length distribution (histogram) of all hits of a query. This is inspired from our work with GeneValidator (https://academic.oup.com/bioinformatics/article/32/10/1559/1742817) and can, for example, help quality-assessment of gene predictions.
Kablammo visualisation (https://academic.oup.com/bioinformatics/article/31/8/1305/212772) for each query-hit pair indicates clearly which parts of the query match which part of the hits.
Circos-style plot of queries and their top hits. This is similar to the circoletto tool (https://academic.oup.com/bioinformatics/article/26/20/2620/194655). For example, it can help visually testing for conserved synteny or gene duplication.
4. We provide a command-line mechanism for importing a BLAST XML file and visualising it in SequenceServer. This works for DIAMOND as well.
5. The 30 hit limit for FASTA download has been removed. In addition, you can now download raw pairwise alignments.
6. Better support for long-running BLAST searches, for rendering large BLAST results (thousands of hits), and for integrating as part of other websites.
7. Improved error handling, security enhancements, and a new look!

Compared to the beta releases, the biggest remaining limitations were SequenceServer's handling of large BLAST results and back button of browsers. We have addressed those.

We request you to try out the "candidate" release of version 2.0 and report any issues you encounter with your setup (or give us a thumbs up). We will update the documentation at http://sequenceserver.com over the next few weeks. In the meantime, please feel free to ask any question here or on GitHub.

Upgrading is simple. If you have Ruby 2.3 or later, run:

```
   gem install --pre sequenceserver
```

This does not remove your current sequenceserver installation. Instead, it changes
the default. If something breaks, you can rollback by running:

```
   gem uninstall sequenceserver
```

Please report any issues here: https://github.com/wurmlab/sequenceserver/issues.

You can also send us pull-requests. We welcome any help you may be able to provide in terms of improving test coverage and making code style checkers happy.

Kind regards,
Priyam & Yannick

## 2019-12-21 Announcing 2.0.0beta4

Dear all,

We are pleased to announce the last beta release of this series. In this release, we have added a few features based on popular demand and fixed tons of bugs.

Overall, the new architecture now feels quite robust and has seen a growing adoption within the community. We have incremented the version number to 2.0 to reflect this milestone. We thank you for your patience, encouragement, and support.

### New features since 1.1.0-beta12

- Update to BLAST+ 2.9.0
- Ability to import BLAST results in XML format from DIAMOND and BLAST versions 2.2.30 - 2.9.0
- Ability to pre-populate textarea with server-sent query sequences (thanks to Richard Challis for feature suggestion and initial implementation)
- On startup, sequenceserver now tries to determine the ip and the hostname of the server and prints two URLs that may be suitable for sharing with colleagues
- Recognise PFAM and RFAM hit/subject ids and include a link to the hits PFAM or RFAM page (credit: Tomas Pluskal)

### Bug fixes and refinements

- In a suburi deployment (e.g., antgenomes.org/blast), take suburi into account when constructing url for the results page (thanks to Guy Leonard for reporting the issue)
- Use more specific regex for determining non -parse_seqids databases. Otherwise, presence of `gn|` in sequence ids would disable sequence retrieval (thanks to Josh Goodman for reporting the issue)
- Length of query and hit sequences are now easily accessible in the report page. This is included in the query and hit header, on the right hand side, in a gray font
- Restored the ability to fold and un-fold individual hits (credit: Josh Goodman)
- Removed .00 from decimal numbers (i.e., 100.00% is now shown as 100%)
- Fixed vertical alignment of links and buttons provided for each hit
- Removed trailing comma in HSP statistics line for BLASTP
- Properly wrap text in the summary overview on top

#### Circos visualisation:

- Sequence lengths were erroneously downscaled by 100. Fixed that
- Formatting of e-value and identities in the tooltips was inconsistent with the rest of the report. Fixed that
- Ribbons had no colour for the specific case of 1 query and 2 hits. Fixed that
- Filter out queries with no hits before drawing the visualisation
- Change to more meaningful title 'Chord diagram: queries and their top hits’

#### Length distribution of all hits for each query:

- When query and database are in different sequence space (DNA or protein), normalise query length to match database space (#409)
- Reduced the number of ticks in the y-axis otherwise the ticks looked too “squeezed up” when there were too many hits
- Round up the number of ticks on x-axis so that the scale ends consistently in a major or a minor tick

### Code quality improvements

- Fixed many of the warning messages generated by React in browser console
- Fixed style guide violations in both Ruby and JavaScript code
- Expanded test coverage and improved automated testing



## 2018-03-22 Announcing a major new version of Sequenceserver 1.1.0-beta 

Dear all,

We are pleased to announce a "beta" release of the next major version of SequenceServer - 1.1.0-beta for testing.

We have fundamentally restructured how SequenceServer works in order to achieve two goals.
 1. Most importantly, with the approach used to date, we were limited in what we could do with visualisations and filtering. The new approach overcomes all of this. 
 2. We felt it was important to be able to bookmark and share BLAST results, and be able to return to them at a later date.

This new version incorporates multiple new minor features (full list below for details), but the biggest change is the "under the hood" restructuring. Today's beta release is experimental - it has some limitations we know about, and we hope that you can help us find those that remain unknown. We expect this release to be the first of a series of small regular improvements each incorporating additional new features.

While we have begun using this version for real things, we consider it a "development" rather than a "production" release. Please use with care and report any problems on the github tracker or on this thread.

### Features

- Update to BLAST 2.6.0+
- We put a customizable default parameter in BLAST searches to only return hits with evalues stronger than 1e-5 (BLAST's default of evalue 10 includes too many spurious hits that are confusing to junior users)
- We make it explicit that '-task blastn' option is used for BLASTN (instead of BLASTN's default behaviour of running megablast)
- Stable URL for results: meaning that results page can now be bookmarked, shared, or linked to from your lab notebook
- "Download FASTA of all" link in the sidebar can handle many sequences (previously it was disabled if >30 hits)
- Ability to download individual or all alignments in FASTA format (code from Kablammo project at http://kablammo.wasmuthlab.org/)
- Ability to download alignment overview in SVG and PNG image (code from Kablammo project at http://kablammo.wasmuthlab.org/)
- Use a, b, c numbering for HSPs to distinguish easily from hits
- Show summary of BLAST database and search parameters at top of results page
- Show coverage and identity in hits table
- results can be opened in a new tab by pressing 'Cmd' / 'Ctrl' button while clicking on the submit button (like any other link).
- Drop support for Ruby older than 2.3. This allows SequenceServer to be embedded in Rails 5, means we benefit from performance improvements in new Ruby, and importantly makes code and dependencies easier to maintain and test
- If BLAST was downloaded by SequenceServer or path to BLAST binaries was explicitly provided by the user, BLAST searches are run in "sandbox mode". In sandbox mode, SequenceServer cannot access any other system command. This increases security.
- We no longer require BLAST databases to have been created with -parse_seqids option of makeblastdb

### Bugfixes

- Alignment overview: colour each HSP by its evalue (instead using the evalue of the hit)
- Fix crash when downloading amino acid sequences that include stop codons (*)
- All code and fonts (except Twitter badge) are loaded locally

### Known issues

As this is beta software, a few things may not work as expected. Following is a list of known issues that we are currently working on:

- Performance with many number of hits: e.g., sequenceserver doesnt load the results of BLASTing a 300 kilobase file including >1000 queries against itself fails. 
- Deploying on suburi (e.g., antgenomes.org/sequenceserver) currently doesn't work
- Hits table can look jumbled up if BLAST search returns multiple hits with same evalue
- Sidebar height is not appropriately constrained
- 6 tests fail on the Travis code checker


### Technical explanation of changes

- We now use browser's default form submission behavior instead of using AJAX. This allows results to be opened in a new tab by pressing 'Cmd' / 'Ctrl' button while clicking on the submit button (like any other link).
- Previously, submitting the search form and obtaining results from the server would be accomplished in one long HTTP request. This was problematic for long running BLAST searches as production servers (e.g., Nginx, Apache) drop connections after a set interval. Now search form submission creates a 'job' (with a unique identifier) whose status is queried repeatedly by the result page. Such 'asynchronous' approach is more scalable and should also work well with job schedulers like qsub and bsub.
- The server now returns results in JSON format instead of HTML format. We use the React framework along with JSX to generate HTML results directly in the browser. Access to raw results directly in the browser has enabled us to test a few different visualisations for BLAST results (not part of this release). This approach also allows the use of 'curl' to obtain results in command line and process the results in any scripting language.


We invite you to try out this release and help us get to a stable version by reporting any bugs on our issue tracker (https://github.com/wurmlab/sequenceserver/issues) or sending us a pull-request.

Upgrading is simple. If you have ruby 2.3 or later, run:

   gem install --version 1.1.0.beta sequenceserver


This does not remove your current sequenceserver installation. Instead, it changes the default 

If something breaks, you can rollback by running:

   gem uninstall --version 1.1.0.beta sequenceserver


We welcome any help you may be able to provide in terms of code review, improving test coverage, and making code style checkers happy.

Kind regards,
Priyam & Yannick


http://wurmlab.com
Evolutionary genomics @ Queen Mary U London
