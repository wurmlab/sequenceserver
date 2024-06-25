/**
 * Dynamically create form and submit.
 *
 * Author: Filip Ter
 */
export default function downloadFASTA(sequence_ids, database_ids) {
    var form = $('<form/>').attr('method', 'post').attr('action', 'get_sequence');
    addField('sequence_ids', sequence_ids);
    addField('database_ids', database_ids);
    addField('_csrf', document.querySelector('meta[name="_csrf"]').content);
    form.appendTo('body').submit().remove();

    function addField(name, val) {
        form.append(
            $('<input>').attr('type', 'hidden').attr('name', name).val(val)
        );
    }
}
