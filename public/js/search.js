$(document).ready(function(){
    $("fieldset.advanced").click(function(event){
        $(this).find("pre").toggle("fast");
    });

    //var seq;
        //get the value of the sequence
    $("#sequence").bind("paste", function(event){
        var element = $(this);
        setTimeout(function(){
            var seq = element.val();
            var seq_type;
            $.post('/ajax', {sequence: seq}, function(data){
                seq_type = data;
                if (seq_type == "nucleotide"){
                    $("#blastp").attr('disabled', 'disabled');
                    $("#tblastn").attr('disabled', 'disabled');
                }
                else if (seq_type == "protein"){
                    $("#blastn").attr('disabled', 'disabled');
                    $("#tblastx").attr('disabled', 'disabled');
                    $("#blastx").attr('disabled', 'disabled');
                }
            });
        }, 10);
    });
});

