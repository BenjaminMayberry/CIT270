const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs')
const {v4 : uuidv4} = require('uuid');
const port = 3000;//4043;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');
const { json } = require('body-parser');

const redisClient = createClient({
    host: "redis-server",
    port: 6379
});
// const redisClient = createClient(
//     {
//     Url:'redis://default@localhost:6379',
// });

app.use(bodyParser.json());

// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert'),
//     passphrase: 'P@ssw0rd'
// }, app).listen(port, () => {
//     console.log('Listening...')
//   }).listen(port, () => {
        // console.log('Listening...')
        //   })


app.listen(port, async ()=>{
    await redisClient.connect();
    console.log("listening on port " + port);
}); 

app.get('/', (req,res)=>{
    res.send("Hello World");
});

app.post("/user", async(req,res)=>{
    
    const newUserRewuestObject = req.body;
    console.log('New User',JSON.stringify(newUserRewuestObject));
    

    const user = await redisClient.hGet('users', req.body.email);
    // console.log(user);
    if (user)
    {
        res.send("User allready exists");
    }
    else
    {
        if (newUserRewuestObject.password == newUserRewuestObject.verifyPassword)
        {
        
        newUserRewuestObject.password = md5(newUserRewuestObject.password);
        newUserRewuestObject.verifyPassword = md5(newUserRewuestObject.verifyPassword);
        

        // console.log(newUserRewuestObject.password)
        redisClient.hSet('users', req.body.email, JSON.stringify(newUserRewuestObject));
        res.status(201);
        res.send('New user '+newUserRewuestObject.email+' added');
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