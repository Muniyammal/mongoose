const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
mongoose.connect("mongodb://localhost:27017/mongoose-demo", { useNewUrlParser: true ,useUnifiedTopology: true });
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    age:{
        type:Number,
        required:true,
        validate(value){
            if(value < 0)
            throw new Error ('Age must not be negative');
        }
    },
    email: {
        type:String,
        required:true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error('It should be an email')
        }
    },
    password: {
        type: String,
        required:true,
        minlength:5
    },
    tokens:[{
         token:{
             type:String,
             required:true        
         }
    }]
}) 
userSchema.methods.toJSON = function (){
    const user = this.toObject()
    delete user.password
    delete user.tokens
    return user;
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
        const token = await jwt.sign({_id:user._id.toString()},'thisismynewcourse')
        user.tokens = user.tokens.concat({token});
        await user.save();
        return token;
    }
userSchema.statics.findByCredentials = async (email,password)=>{
    try{
        const user = await User.findOne({email});
        if(!user)
        throw new Error()
        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch)
        throw new Error()
        return user;
    }catch(e){
       return ("unable to login");
    }
}
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})

const User = mongoose.model('User',userSchema);

module.exports = User;
//const user1 = new User({
  //  name:"Bakya",
    //age:21,
   // email:"vb@gmail.com"
//})
//user1.save()
//.then(res => console.log(res))
//.catch(err=> console.log(err)) 