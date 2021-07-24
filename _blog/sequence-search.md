---
title: "Sequence Search"
date:   2021-07-24 23:03:32"
categories: blast sequence-search
layout: page
---

# Sequence Search

## Why search sequences?

Reasons for performing sequence searches include:

* wanting to know if the Sanger sequence of the gene you cloned indeed matches the sequence you were expecting,
* checking whether targeted CRISPR mutagenesis was successful,
* identifying the sequence of a candidate gene in a newly sequenced genome,
* finding out the potential function of a gene,
* finding paralogs or orthologs of a gene to perform multiple sequence alignment and identify which parts of the sequence are most conserved,
* searching whether oligonucleotide primer sequences are likely to amplify non-target regions of the genome.

## Where to perform sequence searches

The most widely used online portal for sequence searches is [NCBI's BLAST search](https://blast.ncbi.nlm.nih.gov/Blast.cgi). It's a handy go-to place given that NCBI house the vast majority of published nucleotide and protein sequences.

However, other contexts for BLAST sequence search also exist. These include:
The [European Nucleotide Archive](https://www.ebi.ac.uk/ena/browser/sequence-search), which hosts a mirror of NCBI's data,
[UniProt](https://www.uniprot.org/blast/), who have subsets of the protein sequence data that meet specific quality standards,
and domain-specific websites such as [Flybase](http://flybase.org) or the [ant genome database](https://antgenomes.org).

Challenges with such major repositories include that they get a lot of demand. Thus your sequence search can be "queued" for a while until computing capacity becomes available. Furthermore, public websites for sequence search typically have size restrictions on query sequences. Finally, they do not enable you to search against unpublished sequences.

Most sequence search types can also be performed on a local computing cluster, as is found in many universities, research centers and core facilities and institutes.

Our SequenceServer software provides a pragmatic alternative for [performing local BLAST sequence searches](https://www.sequenceserver.com) on your computer, including on unpublished data. You can install it and run it locally on a Mac or Linux (its free). But you'll be limited to your local computing power. Alternatively,  you can use [SequenceServer Cloud](https://www.sequenceserver.com/cloud). Having a SequenceServer Cloud instance enables you (or your team) to have a centrally accessed sequence search repository. Its graphical sequence search interface is fast, accessible from any web browser (including from Windows), takes no space on your computer, and includes many features to facilitate your analysis.

<div class="container">
  <div class="row justify-content-center">
 	<div class="alert alert-info">
	  <p>By leveraging cloud computing and publication-ready graphics, SequenceServer Cloud makes it easy to perform sequence search results and to interpret them. <a href="http://sequenceserver.com/cloud">Learn more</a></p>
	  <p  style="text-align:center"><a href="https://sequenceserver.com/cloud"><img src="/img/logos/SequenceServer_logo.png" alt="Sequence Search with SequenceServer" width="200pt"/></a></p>
    </div>
  </div>
</div>


## The broad diversity of sequence search algorithms

BLAST, whether used at NCBI, as local installation, or [online using a cloud service](https://www.sequenceserver.com/cloud) is the mainly used sequence search algorithm, with **more than 100,000 citations**.

BLAST is great for searching large databases with "small" query sequences. Today's BLAST algorithm is far more computationally efficient than those from twenty years ago. However, BLAST isn't necessarily the most appropriate sequence search algorithm for every job. Other algorithms include BLAT, USearch, minimap. The following article reviews the history of sequence search algorithms and the tradeoffs among search algorithms:

> [**Evolution of biosequence search algorithms: a brief survey**](https://doi.org/10.1093/bioinformatics/btz272)<br/>
> _Gregory Kucherov_. Bioinformatics (2019), 35:3547–3552<br/>
> _Although modern high-throughput biomolecular technologies produce various types of data, biosequence data remain at the core of bioinformatic analyses. However, computational techniques for dealing with this data evolved dramatically.
Results
In this bird's-eye review, we overview the evolution of main algorithmic techniques for comparing and searching biological sequences. We highlight key algorithmic ideas emerged in response to several interconnected factors: shifts of biological analytical paradigm, advent of new sequencing technologies and a substantial increase in size of the available data. We discuss the expansion of alignment-free techniques coming to replace alignment-based algorithms in large-scale analyses. We further emphasize recently emerged and growing applications of sketching methods which support comparison of massive datasets, such as metagenomics samples. Finally, we focus on the transition to population genomics and outline associated algorithmic challenges._
