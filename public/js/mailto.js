export default function asMailtoHref(querydb, program, queries, url, isOpenAccess) {
    const dbsArr = formatDatabases(querydb);
    const mailto = composeEmail(dbsArr, program, queries, url, isOpenAccess);
    return encodeEmail(mailto);
}

function listTop15Items (objArr, key){
    return objArr
        .slice(0, 15)
        .map(obj => `- ${obj[key]}`)
        .join('\n');
}

function formatDatabases(querydb) {
    return 'Databases:\n' + listTop15Items(querydb, 'title');
}

function listQueryIdentifiers(queries){
    return 'Queries:\n' + listTop15Items(queries, 'id');
}

function composeEmail(dbsArr, program, queries, url, isOpenAccess) {
    const upperProgram = program.toUpperCase();
    const accessStatement = isOpenAccess ? '' : 'The link will work if you have access to that particular SequenceServer instance.';
    const queryIdentifiers = listQueryIdentifiers(queries); 
    return `mailto:?subject=SequenceServer ${upperProgram} analysis results &body=Hello,

        Here is a link to my recent ${upperProgram} analysis of ${queries.length} sequences.
            ${url}
        
        Below is a breakdown of the databases and queries used (up to 15 are shown for each).

        ${dbsArr}
            
        ${queryIdentifiers}
    
        ${accessStatement}

        Thank you for using SequenceServer, and please remember to cite our paper.

        Best regards,

        https://sequenceserver.com`;
}

function encodeEmail(mailto) {
    return encodeURI(mailto).replace(/(%20){2,}/g, '');
}
