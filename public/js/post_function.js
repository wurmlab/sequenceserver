// /**
//  * Adaptation of downloadFASTA function to post client-side information to the backend
//  *
//  * Author: Filip Ter
//  * Edited: Diego Pava
//  */ 

export default function postValues(url, keyValuePairs) {
    var form = $('<form/>').attr('method', 'post').attr('action', url);
    for (const [key, value] of Object.entries(keyValuePairs)) {
        addField(key, value);
    }
    form.appendTo('body').submit().remove();



    function addField(name, val) {
        form.append(
            $('<input>').attr('type', 'hidden').attr('name', name).val(val)
        );
    }
}