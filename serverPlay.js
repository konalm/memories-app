var express = require('express');
var app = express(); 
app.use( express.static( "public" ) );

app.set('view engine', 'ejs'); 

app.get('/', function(req, res) {
    var users = ['connor','nathaniel','lilly','francesca','mum']; 
    console.log( users); 

    res.render('play.ejs', { 
        users: users,
        firstName: 'connor',
        lastName: 'moore',
        profilePicPath: '/../uploads/connor@gmail.com-profilePic.jpg'
    }); 

});




app.listen(8080); 
console.log("listening on port 8080"); 