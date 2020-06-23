const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session')
const port = process.env.PORT || 5000;

const app = express()

app.use(session({
	secret: '',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) { //set user session
    res.locals.username = req.session.username;
    next();
  });

//Require pages Route
const routes = require('./routes/pageroutes');
app.use('/', routes)

//Require the user API Route
const usercreds = require('./routes/usercredentials');
app.use('/api', usercreds)

//Require socket.io
const server = require('http').createServer(app);
require('./routes/socketio')(server);

app.get('*', (req, res) =>{
  res.redirect("/dashboard")
})

//Listen for connections
server.listen(port, () => console.log(`server started on port ${port}`));
