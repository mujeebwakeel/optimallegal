function payWithPaystack() {

    var handler = PaystackPop.setup({ 
        key: 'pk_test_348ae71b52605b0c8d320d2121cd5568acfd8e35', //put your public key here
        email: document.getElementById("e-mail").value, //put your customer's email here
        amount: 3700, //amount the customer is supposed to pay
        metadata: {
            custom_fields: [
                {
                    display_name: "Name",
                    variable_name: "Name",
                    value: document.getElementById("Name").value //customer's name
                }
            ]
        },
        callback: function (response) {
            //after the transaction have been completed
            //make post call  to the server with to verify payment 
            //using transaction reference as post data
           if(response.status == "success") {
            document.getElementById("ref").value = response.reference;
            document.getElementById("will").submit();
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