module.exports = server =>{

    const io = require('socket.io')(server)

    //start global connection
    var rooms = 0;
    io.on('connection', function(socket){

        //listen for create game emit
        socket.on('createGame', function(data){
            socket.join('room-' + ++rooms);
            socket.emit('newGame', {name: data.name, room: 'room-'+rooms});
        })

        //listen for join game emit
        socket.on('joinGame', function(data,fn){
            var room = io.nsps['/'].adapter.rooms[data.room];
            if( room && room.length == 1){
                socket.join(data.room);
                socket.broadcast.to(data.room).emit('player2Joined', {name: data.name});
                socket.emit('player2', {name: data.name, room: data.room})
                fn(true);
            }
            else {
                fn(false);
                socket.emit('err', {message: "Sorry, The room is either full or doesn't exist!"});
            }
        });

        //listen for player1 Details emit
        socket.on('player1Details', function(data){
            socket.broadcast.to(data.room).emit('opponent', {name: data.name})
        })

        //listen for when turn is played emit
        socket.on('turnPlayed', function(data){
            socket.broadcast.to(data.room).emit('playTurn', {XorO: data.XorO, clientTurn: data.username, gameGrid: data.gameGrid, room: data.room})
        })

        //listen for when the game ends emit
        socket.on('gameEnded', function(data){
            socket.broadcast.to(data.room).emit('gameEnd', {winningUser: data.username});
            socket.leave(data.room);
        });
    })

}