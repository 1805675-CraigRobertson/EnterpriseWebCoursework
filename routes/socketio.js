module.exports = server =>{

    const io = require('socket.io')(server)

    var rooms = 0;
    io.on('connection', function(socket){

        socket.on('createGame', function(data){
            socket.join('room-' + ++rooms);
            socket.emit('newGame', {name: data.name, room: 'room-'+rooms});
        })

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

        socket.on('player1Details', function(data){
            socket.broadcast.to(data.room).emit('opponent', {name: data.name})
        })

        socket.on('turnPlayed', function(data){
            socket.broadcast.to(data.room).emit('playTurn', {XorO: data.XorO, clientTurn: data.username, gameGrid: data.gameGrid, room: data.room})
        })

        socket.on('gameEnded', function(data){
            socket.broadcast.to(data.room).emit('gameEnd', {winningUser: data.username});
            socket.leave(data.room);
        });
    })

}