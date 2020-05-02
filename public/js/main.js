$(document).ready(function () {
    let clientTurn = false;
    let gameEnded = false;
    let XorO = '';
    let twoPlayers = false;
    let board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    const socket = io.connect();

    //Generate & Display 3x3 grid
    function generate3x3(board) {
        $('#game3x3').remove();
        let table = $('<table id="game3x3">')
        for (i = 0; i < 3; i++) {
            let tr = $('<tr>')
            for (j = 0; j < 3; j++) {
                let td = $('<td>').text(board[i][j]).attr('id', 'row' + j + 'col' + i);
                tr.append(td)
            }
            table.append(tr)
        }
        $('#game').append(table)
    }

    //Updates Grid with user input
    function updateGameGrid() {
        let updatedBoard = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];

        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                updatedBoard[j][i] = $('#row' + i + "col" + j).text()
            }
        }

        board = updatedBoard;
        return board
    }

    //Creates new Game Instance
    $('#createNewGame').click(function () {
        socket.emit('createGame', {
            name: $("#getUsername").text()
        })
        $('#inputs, #backToHome').hide();
        $('#game').show();
        $('#message').text("");
        clientTurn = true;
        XorO = 'X';
    })

    //Updates Player1 Display with Name and Room ID
    socket.on('newGame', function (data) {
        $('#getRoomID').text(data.room)
        $('#chooseOption').text("Send Your Opponent the Room ID: "+ $("#getRoomID").text());
        $('#whosTurn').text("Your Turn! You are X's");
        $('#err').hide();
    })

    //Joins Existing Game Instance
    $('#join').click(function () {
        socket.emit('joinGame', {
            name: $('#getUsername').text(),
            room: $('#roomID').val()
        }, function(data){
            if(data == true){
                $('#inputs').hide();
                $('#game').show();
                clientTurn = false;
                XorO = 'O'
                $('#err').hide()
                $('#message').text("");
            }else{
                $('#err').show().text('Please try Again!')
            }
        })
    })

    //Updates player1 when Player2 enters, displaying their Name, also broadcasts player1 name to player 2
    socket.on('player2Joined', function (data) {
        twoPlayers = true;
        $('#opponent').text("You are playing against: " + data.name);
        $('#chooseOption').hide();

        //emit player1 details to player2
        socket.emit('player1Details', {
            name: $('#getUsername').text(),
            room: $('#getRoomID').text()
        })
        $('#err').text("")
    })

    //Updates Player2 Display with Name and Room ID
    socket.on('player2', function (data) {
        $('#getRoomID').text(data.room)
        $('#chooseOption, #backToHome').hide();
        $('#whosTurn').text("Please Wait For Your Opponent");
    })

    //Updates Player2 Display with Player1 Name
    socket.on('opponent', function (data) {
        $('#opponent').text("You are playing against: " + data.name);
        twoPlayers = true;
    })

    //Error listener
    socket.on('err', function (data) {
        $('#err').show().text(data.message)
    })

    //Checks if its players turn, if so submits data about turn, ie grid location
    $('body').on('click', 'td', function () {
        if (gameEnded == false) {
            if (clientTurn == true && twoPlayers == true) {

                //When user clicks on grid
                let GridBoxAttr = $('#' + $(this).attr('id'));

                if (GridBoxAttr.text() == "X" || GridBoxAttr.text() == "O") {
                    $('#err').show().text("Option Not Valid, Choose Another!")
                } else {
                    GridBoxAttr.text(XorO);
                    updateGameGrid();
                    checkWinner()
                    $('#whosTurn').text("Please Wait For Your Opponent");
                    $('#err').text("")
                    clientTurn = false;
                    socket.emit('turnPlayed', {
                        XorO: XorO,
                        gameGrid: board,
                        username: $('#getUsername').text(),
                        room: $('#getRoomID').text()
                    })
                }
            } else {
                $('#err').show().text("Please Wait for Player 2!")
            }
        }
    })

    //retrive player turn data 
    socket.on('playTurn', function (data) {
        clientTurn = true;
        if (data.XorO == "X") {
            $('#whosTurn').show().text("Your Turn! You are O's");
        } else {
            $('#whosTurn').show().text("Your Turn! You are X's");
        }
        $('#err').hide()
        generate3x3(data.gameGrid)
        updateGameGrid();
    })

    socket.on('gameEnd', function (data) {
        gameEnded = true;
        if(data.winningUser == "tie"){
            $('#message').text("The Game is a tie")
            $('#message').css('color', 'red');
        }else{
            $('#message').text("The winner is: " + data.winningUser)
        }
        if(data.winningUser != $('#getUsername').text()){
            $('#message').css('color', 'red');
        }
        $('#backToHome').show();
    })

    function equals3(a, b, c) {
        return a == b && b == c && a != '';
    }

    function checkWinner() {
        let winner = null;

        let availableSquares = 0;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                if (board[i][j] == "") {
                    availableSquares++;
                }
            }
        }

        // Check Horizontal
        for (let i = 0; i < 3; i++) {
            if (equals3(board[i][0], board[i][1], board[i][2])) {
                winner = board[i][0];
            }
        }

        // Check Vertical
        for (let i = 0; i < 3; i++) {
            if (equals3(board[0][i], board[1][i], board[2][i])) {
                winner = board[0][i];
            }
        }

        // Check Diagonal
        if (equals3(board[0][0], board[1][1], board[2][2])) {
            winner = board[0][0];
        }
        if (equals3(board[2][0], board[1][1], board[0][2])) {
            winner = board[2][0];
        }

        if (winner == null && availableSquares == 0) {
            // return 'tie';
            gameEnded = true;
            $('#message').text("The Game is a tie")
            $('#message').css('color', 'red');
            socket.emit('gameEnded', {
                username: 'tie',
                room: $('#getRoomID').text()
            })
            $('#whosTurn').text("Game Over");
        } else {
            // return winner;
            if (winner != null) {
                gameEnded = true;
                $('#message').text("The winner is: " + $('#getUsername').text())
                socket.emit('gameEnded', {
                    username: $('#getUsername').text(),
                    room: $('#getRoomID').text()
                })
                $('#whosTurn').text("Game Over");
                $('#backToHome').show();
            }
        }
    }

    $('#backToHome').click(function () {
        location.reload();
    })


    $('#game').hide();
    $('#backToHome').hide();
    generate3x3(board)
    updateGameGrid()
});