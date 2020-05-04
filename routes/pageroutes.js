const express = require('express');
const router = express.Router();

//Login GET Route
router.get('/login', async (req, res) => {
    if(req.session.username){
        res.redirect('/dashboard')
    }else{
        res.render('pages/login')
    }
});

//Register GET Route
router.get('/register', (req, res) => {
    if(req.session.username){
        res.redirect('/dashboard')
    }else{
        res.render('pages/register')
    }
})

//Root Route, redirects to Login
router.get('/', async(req, res) => {
    res.redirect('/login');
})

//Dashboard GET Route
router.get('/dashboard', (req,res) => {
    if(req.session.username){
        res.render('pages/dashboard', {username: req.session.username});
    }else{
        res.redirect('/login');
    }
})

//About GET Route
router.get('/about', (req,res) =>{
    res.render('pages/about')
})

//Logout GET route
router.get('/logout', (req,res) =>{
    req.session.destroy()
    res.redirect('/')
})

//Export router
module.exports = router;