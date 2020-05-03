$(document).ready(function(){
    $("#registerButton").click(function() {
        $('#registerErr').text("");
        $.ajax({
            type:'POST',
            url: '/api/register',
            data:JSON.stringify({
                username: $("#username").val(),
                email: $("#email").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                console.log(data)
                if(data.result == 1){
                    window.location.href = "/login"
                }else{
                    $('#registerErr').text(data.msg + data.param);
                }
            }
        })
    })

    $("#loginButton").click(function() {
        $('#loginErr').text("");
        $.ajax({
            type:'POST',
            url: '/api/login',
            data:JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val()}),
                contentType: 'application/json',
            success: function(data){
                console.log(data)
                if(data.result == 1){
                    window.location.href = "/dashboard"
                }else{
                    $('#loginErr').text(data.msg + data.param);
                }
            }    
        })
    })
})