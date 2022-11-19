const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs')
const {v4 : uuidv4} = require('uuid');
const port = 443;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');
const { json } = require('body-parser');

const redisClient = createClient({
    url:"redis://default:dgahoiulegbrlaiusbflihasdbvliauewbvliuwabvolaiudsbvpiuqerbviqeufbiqubfeqiudbsfouyqgdvoiaugsh9q7e8f782yrt8hgq7eghq9p8shdfal77sege7823gthpqiwueg7hq!!!!!!!!!!!!!!!!!!qhjagequ8rgthoq8eiugboeuqwgeyo8eqwiurgboiqeuygfdvoqiyeugfqioeuygfq8i723efgqi8eugfbgq87gqw87eg3o8qwebuguiqegqe35d1g46q8e41g56q5e4g+89eq47g98eq7g468q35e*g7eqe*tA@34.132.105.33:6379",

});
// const redisClient = createClient(
//     {
//     Url:'redis://default@localhost:6379', 
// });

app.use(bodyParser.json());
app.use(express.static("public"))



https.createServer({
    
    key: fs.readFileSync('./SSL/server.key'),
    cert: fs.readFileSync('./SSL/server.cert'),
    ca: fs.readFileSync('./SSL/chain.pem'),
    // passphrase: 'P@ssw0rd'
}, app).listen(port, async () => {
    try {
    await redisClient.connect();
    }
    catch(err)
    {
        document.getElementById("demo").innerHTML = err.message;
    }

    console.log('Listening...')
});
// app.use(express.static(__dirname, { dotfiles: 'allow' } ));


// app.listen(80, () => {
//     console.log('HTTP server running on port 80');
//   });



// app.listen(port, async ()=>{
//     await redisClient.connect();
//     console.log("listening on port " + port);
// }); 

app.get('/', (req,res)=>{
    res.send("Hello World");
});




app.post("/user", async(req,res)=>{
    
    const newUserRequestObject = req.body;
    console.log('New User',JSON.stringify(newUserRequestObject));
    

    const user = await redisClient.hGet('users', req.body.email);
    // console.log(user);
    if (user)
    {
        console.log('User already exists',JSON.stringify(newUserRequestObject));
        res.send("User already exists");
    }
    else
    {
        if (newUserRequestObject.password == newUserRequestObject.verifyPassword)
        {
        
        newUserRequestObject.password = md5(newUserRequestObject.password);
        newUserRequestObject.verifyPassword = md5(newUserRequestObject.verifyPassword);
        

        // console.log(newUserRequestObject.password)
        redisClient.hSet('users', req.body.email, JSON.stringify(newUserRequestObject));
        res.status(201);
        res.send('New user '+newUserRequestObject.email+' added');
        }else
        {
            res.status(400)
            res.send("Password did not the verified password")
        }
    }
}); 

// app.post("/password-reset-request", async(req,res)=>{
//     const loginEmail = req.body.userName;
//     console.log(JSON.stringify(req.body));
//     console.log("loginEmail", loginEmail);
//     const loginPassword = req.body.password;
//     console.log("loginPassword", loginPassword);


//     res.send(token);
// });

// app.post("/password-reset", async(req,res)=>{
//     const loginEmail = req.body.userName;
//     console.log(JSON.stringify(req.body));
//     console.log("loginEmail", loginEmail);
//     const loginPassword = req.body.password;
//     console.log("loginPassword", loginPassword);


//     res.send(token);
// });



app.post("/login", async(req,res)=>{
    const loginEmail = req.body.userName;
    console.log(JSON.stringify(req.body));
    console.log("loginEmail", loginEmail);
    const loginPassword = req.body.password;
    console.log("loginPassword", loginPassword);
    // res.send("Who are you");
    const user = await redisClient.hGet('users', loginEmail);

    // const convert1 = JSON.stringify(user);

    const user_parsed = JSON.parse(user);
    
    console.log(user_parsed);

    // console.log(user_parsed.password);
    // console.log(test)
    if(user_parsed)
    {
    if (user_parsed.userName && md5(loginPassword) == user_parsed.password)
    {
        const token = uuidv4();
        res.send(token);
    }
    else
    {
        res.status(401);
        console.log("password did not match");
        res.send("Invalid user or password");
    }
    }
    else
    {
        res.status(401);//unothorized
        res.send("Invalid user or password");
    }
    // res.send('done')
}); 