const express = require("express");
require('./utils/db'); 
const User = require ('./utils/db'); 
const auth = require('./middleware/auth');
const app = express();
require('dotenv').config();
const nodemailer = require('nodemailer');
const mailgun = require("mailgun-js");

    const data={
        apiKey: "7cc79225eab6ba32cc9f277ccb907e5f-915161b7-300d7f57", 
        domain:'sandbox200ae189ebaf40d6a106841500aad1df.mailgun.org'
  };
  const transporter = nodemailer.createTransport(mailgun(data));
   
let mailOptions = {
    from:"Mailgun Sandbox <postmaster@sandbox200ae189ebaf40d6a106841500aad1df.mailgun.org>",
    to:'muniyammal@calibraint.com',
    subject:'mongodb auth',
    text:'Click to verify the database http://localhost:1234'
     


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