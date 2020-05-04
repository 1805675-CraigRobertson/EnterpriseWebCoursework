$(document).ready(function(){
    //When the register button is clicked
    $("#registerButton").click(function() {
        $('#registerErr').text("");
        //POST user data to server
        $.ajax({
            type:'POST',
            url: '/api/register',
            data:JSON.stringify({ //grab user data from inputs
                username: $("#username").val(),
                email: $("#email").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                if(data.result == 1){ //if register successful
                    window.location.href = "/login"
                }else{
                    $('#registerErr').text(data.msg + data.param);
                }
            }
        })
    })

    //When the login button is clicked
    $("#loginButton").click(function() {
        $('#loginErr').text("");
        //POST user data to server
        $.ajax({
            type:'POST',
            url: '/api/login',
            data:JSON.stringify({ //grab user data from inputs
                username: $("#username").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                if(data.result == 1){ //if login successful
                    window.location.href = "/dashboard"
                }else{
                    $('#loginErr').text(data.msg + data.param);
                }
            }    
        })
    })
})