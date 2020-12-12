$(document).ready(function() {
    
    $('#btnSave').click(function() {
      var sigData = $('#signature').jSignature('getData', 'default');
      $('#hiddenSigData').val(sigData);
      var hidden = $('#hiddenSigData').val();
        if(hidden) {
            $('#submit').attr("disabled", false)
        }else{
            $('#submit').attr("disabled", true)
        }
    });

    $('#btnClear').click(function() {
        $('#signature').jSignature('clear');
        $('#hiddenSigData').val("");
        var hidden = $('#hiddenSigData').val();
        if(hidden) {
            $('#submit').attr("disabled", "false")
        }else{
            $('#submit').attr("disabled", "true")
        }
    })
  })