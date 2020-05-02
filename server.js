const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session')
const bcrypt = require('bcrypt')
const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const app = express()
var server = require('http').createServer(app);
const io = require('socket.io')(server)

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.locals.username = req.session.username;
    next();
  });


app.get('/', async(req, res) => {
    res.redirect('/login');
})

//Login GET & POST
app.get('/login', async (req, res) => {
    if(req.session.username){
        res.redirect('/')
    }else{
        res.render('pages/login')
    }
});

app.get('/userDeets', async (req, res) =>{
    const users = await loadUsersCollection();
    res.send(await users.find({}).toArray())
})

app.post('/login', async (req, res) => {
    const user = await userExist(req)
    if(user != null){
        try{
            if(await bcrypt.compare(req.body.password, user.password)){
                req.session.loggedin = true;
                req.session.username = user.username;
                res.send({result:1, message:'Success'});
            }else{
                //passwords dont match
                res.send({result:2, message: 'Falied2'})
            }
        }catch{
            res.send({result:2, message: 'Falied3'})
        }
    }else{
        //user not found
        res.send({result:2, message: 'Falied1'})
    }
});

async function userExist(req){
    const users = await loadUsersCollection();
    const user = await users.findOne({username: req.body.username});
    if(user == null){
        return new Promise(resolve =>{
            resolve(user);
        })
    }
    return new Promise(resolve =>{
        resolve(user)
    })
}


//Register GET & POST
app.get('/register', (req, res) => {
    res.render('pages/register');
})

app.post('/register', async (req, res) => {
    const users = await loadUsersCollection();
    const user = await userExist(req);
    if(user != null){
        res.send({result:2, message: 'Failed1'})
    }else{
        if(req.body.password == "" || req.body.username == "" || req.body.email == ""){
            res.send({result:2, message: 'Failed2'})
        }else{
            try{
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                await users.insertOne({
                    id: Date.now().toString(),
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword
                });
                res.send({result:1, message: 'Success'})
            }catch{
                res.send({result:2, message: 'Failed3'})
            }
        }
    }
})

//get Database Object
async function loadUsersCollection(){
    const client = await mongodb.MongoClient.connect(url, {
        useNewUrlParser: true
    });
    return client.db('CourseWorkDatabase').collection('users');
}


app.get('/dashboard', (req,res) => {
    if(req.session.username){
        res.render('pages/dashboard', {username: req.session.username});
    }else{
        res.redirect('/login');
    }
})

app.get('/about', (req,res) =>{
    res.render('pages/about')
})

app.get('/logout', (req,res) =>{
    req.session.destroy()
    res.redirect('/')
})

app.get('/tic', (req,res) => {
    res.render('pages/tictactoe');
})

//Socket.io 
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

server.listen(port, () => console.log(`server started on port ${port}`));