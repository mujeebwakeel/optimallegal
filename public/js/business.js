function payWithPaystack() {

    var handler = PaystackPop.setup({ 
        key: 'pk_live_cadfe120f2730e409cf0edc98cd6017f1aa72d79', //put your public key here
        email: document.getElementById("e-mail").value, //put your customer's email here
        amount: 3700, //amount the customer is supposed to pay
        metadata: {
            custom_fields: [
                {
                    display_name: "Name",
                    variable_name: "Name",
                    value: document.getElementById("businessname").value //customer's name
                }
            ]
        },
        callback: function (response) {
            //after the transaction have been completed
            //make post call  to the server with to verify payment 
            //using transaction reference as post data
           if(response.status == "success") {
            document.getElementById("ref").value = response.reference;
            document.getElementById("business").submit();
           } else {
               alert("Transaction not successfull")
           }
        },
        onClose: function () {
            //when the user close the payment modal
            alert('Transaction cancelled');
        }
    });
    handler.openIframe(); //open the paystack's payment modal
}