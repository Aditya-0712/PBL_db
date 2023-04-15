const exp = require("express");
const app = exp();
const BP = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const Evalidate = require("email-validator");
const Pvalidate = require("password-validator");
const cheerio = require("cheerio");
const fs = require("fs");

var inp_name,inp_pass,inp_email;
var schema1 = new Pvalidate();
schema1.is().min(8).is().max(15).has().not().spaces();

const $ = cheerio.load(fs.readFileSync(__dirname + "/Signup.html"));
const lg = cheerio.load(fs.readFileSync(__dirname + "/Login.html"));
const ch = cheerio.load(fs.readFileSync(__dirname + "/Chat.html"));

app.use(BP.urlencoded({extended:true}));
app.use(exp.static(path.join(__dirname + "/public")));
app.set("view engine" , "ejs");

mongoose.connect("mongodb+srv://AdityaBatgeri:Kiq2w2Ak7CR9bYgb@cluster0.d42f6ow.mongodb.net/Eventhub?retryWrites=true&w=majority", {useNewUrlParser:true});

const struc1 = new mongoose.Schema({
    USERNAME:String,
    EMAIL:String,
    PASSWORD:String,
    CHATS:[String]
})

const Profile = mongoose.model("profiles", struc1);

app.get("/" , function(req,res)
{
    res.sendFile(__dirname + "/Login.html");
})

app.get("/Signup.html" , function(req,res)
{
    // console.log($("p.warnemail").css("display"));
    res.sendFile(__dirname + "/Signup.html");
})

app.get("/Login.html" , function(req,res)
{
    res.sendFile(__dirname + "/Login.html");
})

app.post("/Signup.html/" , function(req,res)
{
    inp_name = req.body.username;
    inp_email = req.body.email;
    inp_pass = req.body.password;

    let checkEmail = Evalidate.validate(inp_email);
    let checkPass = schema1.validate(inp_pass);
    if (checkEmail == true && checkPass == true)
    {
        const upload = new Profile({
            USERNAME:inp_name,
            EMAIL:inp_email,
            PASSWORD:inp_pass
        });
        upload.save();
        res.render("index" , {UsEr:inp_name});
    }
    else if (checkEmail == false) 
    {
        $("p.warnpass").css("display" , "none");
        $("p.warnemail").css("display" , "flex");
        res.send($.html());
    }
    else if (checkPass == false)
    {
        $("p.warnemail").css("display" , "none");
        $("p.warnpass").css("display" , "flex");
        res.send($.html());
    }
    else 
    {
        res.send("nooo");
    }
})

app.post ("/Login.html/" , async function(req,res)
{
    inp_name = req.body.username;
    inp_pass = req.body.password;
    var flag = 0;
    var disname,disemail;

    const cursor = Profile.find().cursor();
    for (let obj = await cursor.next();obj != null; obj = await cursor.next())
    {
        if (obj.USERNAME == inp_name && obj.PASSWORD == inp_pass)
        {
            inp_name = obj.USERNAME;
            inp_email = obj.EMAIL;
            flag = 1;
        }
        else if (obj.EMAIL == inp_name && obj.PASSWORD == inp_pass)
        {
            inp_email = obj.EMAIL;
            inp_name = obj.USERNAME;
            flag = 1;
        }
        await obj.save();
    }

    if (flag == 1)
    {
        res.render("index" , {UsEr : inp_name});
    }
    else 
    {
        lg("p.warnpass").css("display" , "flex");
        res.send(lg.html());
    }
})

app.get("/Account.html" , function(req,res)
{
    res.render("Account" , {UsEr : inp_name , EmAiL : inp_email , PaSs : inp_pass});
})

app.get("/index.html" , function(req,res)
{
    res.render ("index" , {UsEr : inp_name});
})

var cHaT;
var FFchats;

app.get("/Chat.html" , async function(req,res)
{
    const cur = await Profile.findOne({USERNAME:inp_name}).cursor().next();
    FFchats = (cur.CHATS);
    for (let i=0; i<FFchats.length; i++)
    {
        console.log(FFchats[i]);
        ch(".chatbox").append('<p class="texts">' + FFchats[i] + '</p>');
    }

    res.send(ch.html());
})

app.post("/Chat.html/" , async function(req,res)
{
    cHaT = req.body.input;
    Profile.updateOne({USERNAME:inp_name} , {$push:{CHATS:cHaT}}).exec();
    res.redirect("/Chat/");
})

app.get("/Chat/" , async function(req,res){

    const cur = await Profile.findOne({USERNAME:inp_name}).cursor().next();
    FFchats = (cur.CHATS);
    ch(".chatbox").append('<p class="texts">' + FFchats[(FFchats.length)-1] + '</p>');
    res.send(ch.html());
})

//admin code

app.listen(3000);