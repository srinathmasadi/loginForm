require('dotenv').config();

const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser= require("cookie-parser");
const auth = require("./middleware/auth");




require("./db/conn");
const Register = require("./models/register");
const { json } = require("express");


const port = process.env.PORT || 3000;




const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");



app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);



app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));



app.get("/", (req, res) => {
    res.render("index");
});

app.get("/secret", auth ,(req, res) => {
   // console.log(`${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/logout", auth ,async(req, res) => {
    try {
        req.user.tokens=[]
        res.clearCookie("jwt");


        console.log("Logged out successfully");
       await  req.user.save();
       res.render("index");
    } catch (error) {
        res.status(500).send(error);
    }
 });

 app.get("/profile" ,auth, (req, res) =>{
    // res.render("database");
    
    Register.findOne({},  (err, data)=>{
        if(err){
            res.json(err);
        }else{

            res.render("database", {records : data})
        }

    })
})


app.get("/register.hbs?",(req,res)=>{
    res.render("register");
});


app.get("/register", (req, res) => {
    res.render("register");
});

// ************************************************************
// Create User...
app.post("/register", async(req, res) => {
    try{
        
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if(password === confirmPassword) {

            const registerEmployee = new Register({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmPassword: password
            })

            const token =await registerEmployee.generateAuthToken();

            //Cookies
            res.cookie("jwt", token,{
                expires:new Date(Date.now()+ 30000),
                httpOnly:true
            });

            // Secure Password using Hashing...

            const registered = await registerEmployee.save();
 
            res.status(201).render("login");

        }else{
            res.send("Password are not matching");
        }

    }catch(e){
        res.status(400).send(e);
        console.log("the error part page");
    };
});
// ..............................................................

// LOGINNN

app.get("/login", (req, res) => {
    res.render("login");
});

// ..............................................................
// Get User
app.post("/login", async(req, res) => {

    try{
        const email = req.body.email;
        const password = req.body.password;

        const userLogin = await Register.findOne({email});
     
        const isMatch = await bcrypt.compare(password, userLogin.password);

        const token =await userLogin.generateAuthToken();
       // console.log("the token part" + token);

        res.cookie("jwt", token,{
            expires:new Date(Date.now()+ 600000),
            httpOnly:true
        });

        if(isMatch) {
            res.status(201).render("secret");
        }else{
        
            res.status(400).send("Invalid login Details");
        }

    }catch(e){

        res.status(400).send("Invalid login Details");
    }
   
});



// Listening Port..........................................
app.listen(port, () => {
    console.log(`Server is running at port number ${port}`);
});