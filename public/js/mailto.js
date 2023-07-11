export default function asMailtoHref(querydb, program, numQueries, url, isOpenAccess) {
  var dbsArr = [];
  let i = 0;
  while (querydb[i] && i < 15) {
    dbsArr.push(' ' + querydb[i].title);
    i += 1;
  }

  var mailto = `mailto:?subject=SequenceServer ${program.toUpperCase()} analysis results &body=Hello,

      Here is a link to my recent ${program.toUpperCase()} analysis of ${numQueries} sequences.
          ${url}

      The following databases were used (up to 15 are shown):
          ${dbsArr}

      ${isOpenAccess ? '' : 'The link will work if you have access to that particular SequenceServer instance.'}

      Thank you for using SequenceServer, and please remember to cite our paper.

      Best regards,

      https://sequenceserver.com`;

  var message = encodeURI(mailto).replace(/(%20){2,}/g, '');
  return message;
}