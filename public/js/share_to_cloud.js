/**
 * Set of functions to send jobs to the cloud server.
 *
 * Author: Diego Pava
 */

 shareCloud() {
    function getEmails(){
        let emails = prompt("Please insert the email address(es) to share these results. Use a ',' to separate each email");
        let emailList = emails.split(',');

        var form = $('<form/>').attr('method', 'post').attr('action', 'cloudShare');
        var jobID = this.props.data.search_id;
        addField('id', jobID);
        addField('emails', emailList);
        form.appendTo('body').submit().remove();

    function addField(name, val) {
        form.append(
            $('<input>').attr('type', 'hidden').attr('name', name).val(val)
        );

    }
    };

    // Takes the response and displays it as an alert.
    function fetchResponse(){
        var response = fetch('/response')
            .then(resp => resp.json())
            .then(data => alert(data +'\n You will be redirected to your results now'));
        return response
    }

    setTimeout(()=>{
        fetchResponse(),2000
    });

}