const convertChunk = (fastqChunk) => {
    fastqChunk[0] = '>' + fastqChunk[0].substring(1);
    return fastqChunk.slice(0, 2);
};

const isValidFastq = (fastqChunk) => {
    if (fastqChunk.length !== 4) {
        return false;
    }

    return fastqChunk[0][0] === '@' && fastqChunk[2][0] === '+' && fastqChunk[1].length === fastqChunk[3].length;
};

export const fastqToFasta = (sequence) => {
    let trimmedSequence = sequence.trim();
    // return unmodified if sequence does not look like fastq
    if (!trimmedSequence.startsWith('@')) {
        return sequence;
    }

    const sequenceLines = trimmedSequence.split('\n');
    const fastaChunks = [];

    for (let i = 0; i < sequenceLines.length; i += 4) {
        const fastqChunk = sequenceLines.slice(i, i + 4);
        if (isValidFastq(fastqChunk)) {
            fastaChunks.push(...convertChunk(fastqChunk));
        } else {
            // return unmodified sequence if it does not look like valid fastq
            return sequence;
        }
    }

    return fastaChunks.join('\n');
};