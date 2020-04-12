$(document).ready(function () {
    var clientTurn = false;
    var gameEnded = false;
    var XorO = 'X';
    var twoPlayers = false;
    $('#game').hide();
    $('#backToHome').hide();

    // const socket = io.connect('localhost:5000');
    // const socket = io.connect('192.168.1.193:5000');
    const socket = io.connect();

    let board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    generate3x3(board)
    updateGameGrid()

    //Display 3x3 grid
    function generate3x3(board) {
        $('#game3x3').remove();
        var table = $('<table id="game3x3">')
        for (i = 0; i < 3; i++) {
            var tr = $('<tr>')
            for (j = 0; j < 3; j++) {
                var td = $('<td>').text(board[i][j]).attr('id', 'row' + j + 'col' + i);
                tr.append(td)
            }
            table.append(tr)
        }
        $('#game').append(table)
    }

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
    $('#send').click(function () {
        socket.emit('createGame', {
            name: $("#name").val()
        })
        $('#inputs').hide();
        $('#game').show();
        $('#chooseOption').hide();
        $('#backToHome').hide();
        clientTurn = true;
        XorO = 'X';
    })

    //Updates Player1 Display with Name and Room ID
    socket.on('newGame', function (data) {
        $('#getUsername').text(data.name)
        $('#getRoomID').text(data.room)
        $('#whosTurn').text("Your Turn! You are X's");
    })

    //Updates when Player2 enters displayinh their Name, also broadcasts player1 name to player 2
    socket.on('player1', function (data) {
        twoPlayers = true;
        $('#opponent').text("You are playing against: " + data.name);
        socket.emit('player1Details', {
            name: $('#getUsername').text(),
            room: $('#getRoomID').text()
        })
        $('#err').text("")
        $('#chooseOption').hide();
        $('#backToHome').hide();
    })

    //Updates Player2 Display with Name and Room ID
    socket.on('player2', function (data) {
        $('#getUsername').text(data.name)
        $('#getRoomID').text(data.room)
    })

    //Updates Player2 Display with Player1 Name
    socket.on('opponent', function (data) {
        $('#opponent').text("You are playing against: " + data.name);
        twoPlayers = true;
    })

    //Joins Excisting Game Instance
    $('#join').click(function () {
        socket.emit('joinGame', {
            name: $('#joinName').val(),
            room: $('#roomID').val()
        })
        $('#inputs').hide();
        $('#game').show();
        clientTurn = false;
        XorO = 'O'
    })

    //Error listener
    socket.on('err', function (data) {
        $('#err').text(data.message)
    })

    //Checks if its players turn, if so submits data about turn, ie grid location
    $('body').on('click', 'td', function () {
        if (gameEnded == false) {
            if (clientTurn == true && twoPlayers == true) {

                //When user clicks on grid
                var idAttr = $(this).attr('id');
                if ($('#' + idAttr).text() == "X" || $('#' + idAttr).text() == "O") {
                    $('#err').text("Option Not Value, Choose Another!")
                } else {
                    $('#' + idAttr).text(XorO);
                    updateGameGrid();
                    checkWinner()
                    $('#whosTurn').text("Please Wait For Your Opponent");
                    $('#err').text("")
                    clientTurn = false;
                    if (gameEnded == false) {
                        socket.emit('turnPlayed', {
                            XorO: XorO,
                            gameGrid: updateGameGrid(),
                            username: $('#getUsername').text(),
                            room: $('#getRoomID').text()
                        })
                    }

                }
            } else {
                $('#err').text("Please Wait for Player 2!")
            }
        } else {
            console.log("Game has ended")
        }
    })

    //retrive player turn data 
    socket.on('playTurn', function (data) {
        clientTurn = true;
        if (data.XorO == "X") {
            $('#whosTurn').text("Your Turn! You are O's");
        } else {
            $('#whosTurn').text("Your Turn! You are X's");
        }
        $('#whosTurn').show();
        generate3x3(data.gameGrid)
        updateGameGrid();
    })

    socket.on('gameEnd', function (data) {
        gameEnded = true;
        console.log(gameEnded)
        $('#message').text("The winner is: " + data.winningUser)
        $('#whosTurn').text("Please Wait For Your Opponent");
        $('#backToHome').show();
    })

    function equals3(a, b, c) {
        return a == b && b == c && a != '';
    }


    function checkWinner() {
        let winner = null;

        var count = 0;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                if (board[i][j] == "") {
                    count++;
                }
            }
        }

        // horizontal
        for (let i = 0; i < 3; i++) {
            if (equals3(board[i][0], board[i][1], board[i][2])) {
                winner = board[i][0];
            }
        }

        // Vertical
        for (let i = 0; i < 3; i++) {
            if (equals3(board[0][i], board[1][i], board[2][i])) {
                winner = board[0][i];
            }
        }

        // Diagonal
        if (equals3(board[0][0], board[1][1], board[2][2])) {
            winner = board[0][0];
        }
        if (equals3(board[2][0], board[1][1], board[0][2])) {
            winner = board[2][0];
        }

        if (winner == null && count == 0) {
            // return 'tie';
            gameEnded = true;
            $('#message').text("The winner is: tie")
            socket.emit('gameEnded', {
                username: 'tie',
                room: $('#getRoomID').text()
            })
            $('#whosTurn').text("Please Wait For Your Opponent");
        } else {
            // return winner;
            if (winner != null) {
                gameEnded = true;
                $('#message').text("The winner is: " + $('#getUsername').text())
                socket.emit('gameEnded', {
                    username: $('#getUsername').text(),
                    room: $('#getRoomID').text()
                })
                $('#whosTurn').text("Please Wait For Your Opponent");
                $('#backToHome').show();
            }
        }
    }

    $('#backToHome').click(function () {
        location.reload();
    })
});