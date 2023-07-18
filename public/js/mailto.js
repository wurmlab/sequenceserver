export default function asMailtoHref(querydb, program, numQueries, url, isOpenAccess) {
    const dbsArr = formatDatabases(querydb);
    const mailto = composeEmail(dbsArr, program, numQueries, url, isOpenAccess);
    return encodeEmail(mailto);
}

function formatDatabases(querydb) {
    return querydb
        .slice(0, 15)
        .map(db => ' ' + db.title);
}

function composeEmail(dbsArr, program, numQueries, url, isOpenAccess) {
    const upperProgram = program.toUpperCase();
    const accessStatement = isOpenAccess ? '' : 'The link will work if you have access to that particular SequenceServer instance.';

    return `mailto:?subject=SequenceServer ${upperProgram} analysis results &body=Hello,

        Here is a link to my recent ${upperProgram} analysis of ${numQueries} sequences.
            ${url}

        The following databases were used (up to 15 are shown):
            ${dbsArr}

        ${accessStatement}

        Thank you for using SequenceServer, and please remember to cite our paper.

        Best regards,

        https://sequenceserver.com`;
}

function encodeEmail(mailto) {
    return encodeURI(mailto).replace(/(%20){2,}/g, '');
}
