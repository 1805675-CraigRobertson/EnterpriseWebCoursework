//Require MongoDB
const mongodb = require('mongodb');
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'

//Method to check is a User Already Exists
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

//Retrieve all Users from DB
async function loadUsersCollection(){
    const client = await mongodb.MongoClient.connect(url, {
        useNewUrlParser: true
    });
    return client.db('CourseWorkDatabase').collection('users');
}

//Export methods to be used in other files
module.exports.loadUsers = loadUsersCollection;
module.exports.userExist = userExist;