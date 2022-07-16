var express=require("express");
var bodyParser=require("body-parser");
var nodemailer = require('nodemailer');

//connecting mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Quizzer');
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
   console.log("connection succeeded");
})
var app=express()

//bodyParser
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: true
}));

//POST SignUp
var data={
	"name": '',
	"email": '',
	"password": ''
};
var otp=0;
app.post('/sign_up', function(req,res){
   var name = req.body.name;
   var email =req.body.email;
	 console.log(email);
	 data.name = name;
	 data.email = email;

	 function mailSend(email)
	 {
		 //nodemailer

		 //randomvariable
		otp=Math.random();
		otp=otp*10000;
		otp=Math.floor(otp+1);
		var str="Your One Time Password is ";
		str+=otp;
		console.log(str);

		 var transporter = nodemailer.createTransport({
		   service: 'gmail',
		   auth: {
		     user: 'helloak2000@gmail.com',
		     pass: 'kuebcedlqirykvdf'
		   }
		 });

		 var mailOptions = {
		   from: 'helloak2000@gmail.com',
		   to: email,
		   subject: 'Email Verification',
		   text: str
		 };

		 transporter.sendMail(mailOptions, function(error, info){
		   if (error) {
		     console.log(error);
		   } else {
		     console.log('Email sent: ' + info.response);
		   }
		 });
	 }
	 mailSend(email);


   return res.redirect('verification.html');
})

//POST Verify
app.post("/verification",function(req,res){
	var otpKey = req.body.otp;
	var password =req.body.password;

	data.password = password;
	var otpVal = JSON.parse(otp);
	console.log(typeof(otpVal.toString()),typeof(otpKey));
	console.log(otpVal.toString(),otpKey);
	if(otpVal.toString()===otpKey)
	{
		console.log("in db");
		db.collection('details').insertOne(data,function(err, collection){
    if (err) throw err;
       console.log("Record inserted Successfully");
    });
	}
	else console.log("OTP not matched");
	res.redirect('create.html');
})

//POST Login
var loginData = {
	"email": '',
	"password": ''
};
app.post("/login",function(req,res)
{
	loginData.email = req.body.email;
	loginData.password =req.body.password;

	db.collection('details').findOne(loginData,function(err, result){
	if (err) throw err;
	if (result===null) console.log("Incorrect credentials");
	else console.log(result.name + " welcome to Quizzer");
	});
	res.redirect('create.html');
})

var questionSchema = mongoose.Schema({
    questionText:String,
    option1: String,
    option2: String,
    option3: String,
    option4: String,
    answer : String
});

const Question = mongoose.model("Question",questionSchema);
app.post('/question',function(req,res){
    var quest=req.body.ques;
    var opt1=req.body.option1;
    var opt2=req.body.option2;
    var opt3=req.body.option3;
    var opt4=req.body.option4;
    var answ=req.body.ans;
    const question=new Question({
        questionText:quest,
        option1: opt1,
        option2: opt2,
        option3: opt3,
        option4: opt4,
        answer : answ
    });
    question.save();
    res.sendFile(__dirname+"/public/create2.html");
});
//GET
app.get('/',function(req,res){
   res.set({
      'Access-control-Allow-Origin': '*'
   });
   return res.redirect('index.html');
}).listen(3000)

console.log("server listening at port 3000");