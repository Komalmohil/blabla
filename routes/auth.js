const express= require('express');
const router =express.Router();
const User= require('../Models/User');
const jwt =require('jsonwebtoken');
const verifyToken= require('../Middleware/verifyToken');
const sendMail = require('../Middleware/sendMail');
const auth = require('../Middleware/authRoute');
const bcrypt = require('bcrypt');

router.get('/',auth,(req,res)=>{
    console.log("Is Logged In:",req.isLoggedIn);
    console.log("Username:",req.username);
    res.render('home',{   isLoggedIn:req.isLoggedIn,  username: req.username });
});

router.get('/login',auth,(req, res)=>{
    console.log("Is Logged In:",req.isLoggedIn);
    console.log("Username:",req.username);

  res.render('login', {
    isLoggedIn: req.isLoggedIn || false,
    username: req.username||null
  });
});

router.get("/login/email",(req,res)=>{
  res.render('email',{
    isLoggedIn: req.isLoggedIn,
    username: req.username
  }); 
});


router.post('/login/email',async (req,res)=>{
  const {email,password} =req.body;
  const user=await User.findOne({email});
  if (!user) return res.send("Invalid user details");

  const isMatch=await bcrypt.compare(password,user.password);
  if (!isMatch) return res.send("Invalid user details");

  const token = jwt.sign( { id:user._id, username:user.username }, process.env.secretKey,{ expiresIn: '1d' });

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000000000
  });
  return res.redirect('/search');
});


router.post("/check-email",async (req,res)=>{
  const {email}=req.body;
  try {
    const existingUser =await User.findOne({email});
    if(existingUser){   res.json({exists:true}); } 
    else { res.json({exists:false}); }
  }catch (err){
    console.log(err); 
    res.status(500).json({ error: 'Internal Server Error' });}
});

router.get("/signup",(req,res)=>{
   res.render("signup",{   isLoggedIn:req.isLoggedIn,  username:req.username  }); 
});

router.post('/signup',auth, async (req,res)=>{
  const {email,username,phone,password}= req.body;
  try {
    const hashedPassword= await bcrypt.hash(password, 10);
    const newUser= new User({email,username,phone,password: hashedPassword});
    await newUser.save();
    console.log('User registered');

    res.render("home", {isLoggedIn:req.isLoggedIn,  username:req.username})
  } catch (err) {
    console.error('err');
    res.status(500).send('Error registering user');
  }
});

router.get("/forget",(req, res)=>{
    res.render('forget')   
 });

router.post('/forget', async(req, res)=>{
  const {email} =req.body;
  const user=await User.findOne({ email });

  if (!user) return res.send("Invalid email");

  const secretKey=process.env.secretKey;
  const token= jwt.sign({ id: user._id,username:user.username},secretKey,{ expiresIn:'10m'});
  
  const resetLink= `http://localhost:${process.env.port}/forgot/${token}`;

  const result=await sendMail({
    to: email,
    subject: 'Reset Password Link',
    html: `<p>Click to reset password:</p>
        <button><a href="${resetLink}">Click Here</a><button>`
  });

  if(result.success){
    res.render("login");
  } else {
    res.send("Failed to send email.");
  }
});

router.get('/forgot/:token',(req, res)=>{
  res.render('reset',{token:req.params.token});
});

router.post('/reset/:token',verifyToken,async(req,res) => {
  const {pass,confirmPass}= req.body;

  if(pass !==confirmPass){
    return res.send("pass donot match"); 
  }
  try{
    const user=await User.findById(req.userId);
    if (!user)return res.send("User not found");
    const hashedPassword = await bcrypt.hash(pass, 10);
    user.password = hashedPassword;
    await user.save();
    return res.render("email",{ isLoggedIn: false,username:null});
  } catch(err){
    console.error(err);
  }
});

router.get('/logout',(req, res)=> {
  res.clearCookie('token');
  res.redirect('/login');
});


module.exports =router;
