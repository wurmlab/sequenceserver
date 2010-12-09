$(document).ready(function(){
    $("fieldset.advanced").click(function(event){
        $(this).find("pre").toggle("fast");
    });
});

