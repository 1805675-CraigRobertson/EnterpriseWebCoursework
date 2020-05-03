const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session')
const port = process.env.PORT || 5000;

const app = express()

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

const routes = require('./routes/pageroutes');
app.use('/', routes)

const usercreds = require('./routes/usercredentials');
app.use('/api', usercreds)

const server = require('http').createServer(app);
require('./routes/socketio')(server);

server.listen(port, () => console.log(`server started on port ${port}`));