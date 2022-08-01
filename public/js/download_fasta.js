import postValues from './post_function'
/**
 * Dynamically create form and submit.
 *
 * Author: Filip Ter
 * Edited: Diego Pava
 */

export default function downloadFASTA(sequence_ids, database_ids) {
    postValues('get_sequence', {'sequence_ids': sequence_ids, 'database_ids':database_ids});
}
 
