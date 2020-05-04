//Require MongoDB
const mongodb = require('mongodb');
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'

//Method to check is a User Already Exists
async function userExist(req){
    const users = await loadUsersCollection(); //load all users
    const user = await users.findOne({username: req.body.username}); //find specific user
    if(user == null){ //if user not found return null
        return new Promise(resolve =>{
            resolve(user);
        })
    }
    //if user exist return user data
    return new Promise(resolve =>{
        resolve(user)
    })
}   

//Retrieve all Users from DB
async function loadUsersCollection(){
    //connect to Database
    const client = await mongodb.MongoClient.connect(url, {
        useNewUrlParser: true
    });
    return client.db('CourseWorkDatabase').collection('users');
}

//Export methods to be used in other files
module.exports.loadUsers = loadUsersCollection;
module.exports.userExist = userExist;