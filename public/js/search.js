$(document).ready(function(){
    $("fieldset.advanced").click(function(event){
        $(this).find("pre").toggle("fast");
    });

    $("#sequence").bind("paste", function(event){
        //store the matched element
        var element = $(this);

        //the pasted text isn't immediately set as the value of the textbox,
        //so we trigger sequence detection after 10ms
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

