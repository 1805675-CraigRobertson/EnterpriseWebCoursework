$(document).ready(function(){
    $("#registerButton").click(function() {
        $('#registerErr').text("");
        $.ajax({
            type:'POST',
            data:JSON.stringify({
                username: $("#username").val(),
                email: $("#email").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                console.log(data.result)
                if(data.result == 1){
                    window.location.href = "/login"
                }else if(data.result == 2){
                    $('#registerErr').text("Error try again");
                }
            }
        })
    })

    $("#loginButton").click(function() {
        $('#loginErr').text("");
        $.ajax({
            type:'POST',
            data:JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                console.log(data.result)
                if(data.result == 1){
                    window.location.href = "/dashboard"
                }else if(data.result == 2){
                    $('#loginErr').text("Error try again");
                }
            }    
        })
    })
})