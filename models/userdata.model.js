const mongodb = require('mongodb');
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'

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

async function loadUsersCollection(){
    const client = await mongodb.MongoClient.connect(url, {
        useNewUrlParser: true
    });
    return client.db('CourseWorkDatabase').collection('users');
}

module.exports.loadUsers = loadUsersCollection;
module.exports.userExist = userExist;