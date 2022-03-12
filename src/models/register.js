const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");




// Schema...
const employeeSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
   
});
//GEnerating tokens
employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token =  jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token})
        await this.save();
        return token;
    } catch(error){
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}

// Secure Password using Hashing...
employeeSchema.pre("save", async function(next) {

    if(this.isModified("password")){
      
        this.password = await bcrypt.hash(this.password, 10);
        
        this.confirmPassword = await bcrypt.hash(this.password, 10);
        
    }
    next();
});


// Collection...
const Register = new mongoose.model("Register", employeeSchema);

// Export...
module.exports = Register;