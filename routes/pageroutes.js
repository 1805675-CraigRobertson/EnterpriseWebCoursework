const express = require('express');
const router = express.Router();

router.get('/login', async (req, res) => {
    if(req.session.username){
        res.redirect('/dashboard')
    }else{
        res.render('pages/login')
    }
});

router.get('/register', (req, res) => {
    if(req.session.username){
        res.redirect('/dashboard')
    }else{
        res.render('pages/register')
    }
})

router.get('/', async(req, res) => {
    res.redirect('/login');
})

router.get('/dashboard', (req,res) => {
    if(req.session.username){
        res.render('pages/dashboard', {username: req.session.username});
    }else{
        res.redirect('/login');
    }
})

router.get('/about', (req,res) =>{
    res.render('pages/about')
})

router.get('/logout', (req,res) =>{
    req.session.destroy()
    res.redirect('/')
})

module.exports = router;