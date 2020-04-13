const express = require("express");
require('./utils/db'); 
const User = require ('./utils/db'); 
const auth = require('./middleware/auth');
const index = require('./views/index');
const app = express();
require('dotenv').config();
const nodemailer = require('nodemailer');
const hbs  = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port:465,
  secure:true,
    service :'smtp.gmail.com',
    auth:{
        user:'vinayagajo25@gmail.com',
        pass:'muthumuni'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
});
const handlebarOptions = {
    viewEngine: { 
      extName: '.hbs',
      partialsDir: 'views/partials/',
      layoutsDir: 'views/index/'
    },
    viewPath:'views/index/',
    extName: '.hbs',

  };
  transporter.use('compile', hbs(handlebarOptions));
  
  
let mailOptions = {
    from:'vinayagajo25@gmail.com',
    to:'muniyammal@calibraint.com',
    subject:'mongodb auth',
    text:'Click to verify the database',
    template: 'index'
    


}



transporter.sendMail(mailOptions,function(err,sucess){
    if(err){
        console.log('error occurs',err);
    }else{
        console.log('Email is send!!!');
    }
});


app.use(express.json());
app.post('/users',auth,async(req,res) => {
    const user = new User(req.body) ;  
    try{
       const token =  await user.generateAuthToken()
       res.send({ user,token});
       }catch(e){
           res.send(e.message);
       }
})

app.post('/users/login',async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
});
app.get('/users/me',auth,async(req,res) =>{
    try{
        res.send(req.user);
    }catch(e){
        res.send();
    }
})
/*app.post('/users/logout',auth,async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save();
        res.status(200).send(req.user);
    }catch(e){
        res.send();
    }
})*/

app.get('/users/:id' ,auth,async (req,res)=>{
    console.log(req.params);
    try{
        const user = await User.findById(req.params.id);
        if(!user)
        return res.send();
        res.send(user);
    }catch(e){
        res.send(e.messages);
    }
})
app.patch('/users/:id',auth,async(req,res)=>{
    try{
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true , runValidator:true})
        if(!user)
        return res.send("updated successfully");
        res.send(user);
    }catch(e){
        res.send(e.message);
    }
})

app.delete('/users/:id',auth,async (req,res) =>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user)
        return res.send("deleted successfully");
        res.send(user);

    }catch(e){
        res.send(e.message);
    }
});
app.listen(1234);
console.log("Ready to use port 1234");
app.get('/',(req,res)=>{
    res.send('Testing');
});