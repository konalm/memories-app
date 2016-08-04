var http = require('http');
var fs = require('fs');
var url = require('url'); 
var qs = require('querystring'); 
var bodyParser = require('body-parser'); 
var express = require('express');
var app = express(); 

app.use(bodyParser.json({limit: '50mb'})); 
app.use(express.static(__dirname)); 

var mysql = require('mysql'); 
var path = require('path'); 
var multer = require('multer'); 
var md5 = require('js-md5');

var photoName = ""; 
var passedValidation = false; 

var unameError = ""; 
var passwError = ""; 

var memories = []; 

var ca_fnameError = "";
var ca_lnameError = "";
var ca_emailError = ""; 
var ca_passwError = ""; 
var ca_passwConfirmError = ""; 

var loginError = false; 


if (typeof localStorage == "undefined" || localStorage === null ) {
    var LocalStorage = require('node-localstorage').LocalStorage; 
    localStorage = new LocalStorage('./scratch'); 
}

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads'); 
    },
    filename: function (req, file, callback) {
        photoName = emailLoggedIn + '-profilePic.jpg'; 
        callback(null, photoName); 
    }
});

var upload = multer({ storage : storage }).single('profilePic'); 

if ( localStorage.getItem('LoggedIn') == undefined ) {
    localStorage.setItem('LoggedIn', 'false'); 
} 


app.post('/api/photo', function(req,res) {
    upload(req,res, function(err) {
        if (err) {
            console.log(err); 
            return res.end("Error uploading files"); 
        }
        res.end("File is uploaded"); 
        console.log("Photo name " + photoName);
        
        var conn = mysql.createConnection({
            host : 'localhost',
            user : 'connor',
            password : '10Superstar',
            database : 'MyDB2'
        }); 
        
        var photoPath = "uploads/" + photoName; 
        var sqlQuery = " UPDATE ProfilePics SET ProfilePicPath = '" + photoPath + "' WHERE EMAIL = '" + localStorage.getItem('EmailLoggedIn') + "' "; 
        console.log(sqlQuery); 
        
        conn.query( sqlQuery, function(err, result) {
            if (err) {
                console.log("query error");
                console.log(err); 
            } else {
                console.log("inserted info successfully");
            }
        });
        
    });
});


app.post('/api/addMem', function(req, res, next) {

    var mem= req.body.nameMem;
    console.log("recieved add memory request ", req.body);  
    console.log(mem); 
   // return res.send('ok'); 

    // connect to database 
    var conn = mysql.createConnection({
        host : 'localhost',
        user : 'connor',
        password : '10Superstar',
        database : 'MyDB2'
    });

    // run query 
    var email = localStorage.getItem("EmailLoggedIn"); 
  /*  var sqlQuery = "INSERT INTO Memories(Email, Memory)" +
                    "WHERE Email = '" + email + "'" +
                    "VALUES ( '" + email + "', '" + mem + "' )"; */ 

    var sqlQuery = "INSERT INTO Memories(Email, Memory)" +
                    "VALUES ( '" + email + "', '" + mem + "' )";
                 
    console.log(sqlQuery); 
                   
    conn.query(sqlQuery, function(err, result) {
        if (err) {
            console.log("query error"); 
            console.log(err);
            return res.send("error adding memory"); 
        } else {
            console.log("inserted memory into database"); 
            return res.send("added memory successfully")
        }
    });

}); // function() -> END

app.get('/memories', function(req,res) {
    CollectMemories(req,res); 
}); 


function CollectMemories(req, res) {

    // connect
    var conn = mysql.createConnection({
        host : 'localhost',
        user : 'connor',
        password : '10Superstar',
        database : 'MyDB2'
    });

    // check connection 
    conn.connect(function(err) {
        if (err) {
            console.log("connection error"); 
        } else {
            console.log("connection successful"); 
        }
    });

    var email = localStorage.getItem('EmailLoggedIn'); 
    var sql = "SELECT Memory FROM Memories WHERE Email = '" + email + "' "; 

    conn.query( sql, function(err, result) {
        if (err) {
            console.log("email query error"); 
            res.send("error obtaining data"); 
        } else {
            console.log("obtained data -->"); 
            memories = [];
            for ( var i=0; i<result.length; i++ ) {
                console.log(result[i].Memory ); 
                memories.push(result[i].Memory); 
            }
            
            console.log(memories); 
       //     res.send("Data obtained successfully"); 
        }
    }); 

} // function() -> END

 
function serve_createAccount(file, res) {
    
    fs.readFile(file, function(err, data) {
        data = data.toString('utf8'); 
        data = data.replace('{{_fnameError}}', ca_fnameError); 
        data = data.replace('{{_lnameError}}', ca_lnameError); 
        data = data.replace('{{_emailError}}', ca_emailError);
        data = data.replace('{{_passwError}}', ca_passwError); 
        data = data.replace('{{_passwConfirmError}}', ca_passwConfirmError); 
        res.writeHead(200, {'Content-type': 'text/html'}); 
        res.write(data);
        res.end();
    });
}


app.get('/', function(req,res) {
    
   console.log("request - home page");  
   
   if ( localStorage.getItem('LoggedIn') == 'true' ) {
       res.redirect('profile'); 
   } else {
       loginError = false; 
       serve_login('login.html',res);
   }
    
});


app.get('/profile', function(req,res) {
    
  console.log("recieved request - profile"); 
     
  if ( localStorage.getItem('LoggedIn') == 'true' ) {
      console.log("profile request - logged in"); 
        
    var file = "secretPage.html"; 
    var firstName = "";
    var lastName = "";
    var email = "";
    var profilePicPath = ""; 
    
    var conn = mysql.createConnection({
        host : 'localhost',
        user : 'connor',
        password : '10Superstar',
        database : 'MyDB2'
    });
    
    console.log( "email logged in " + localStorage.getItem('EmailLoggedIn') ); 
    var sqlQuery = "SELECT * FROM Accounts WHERE Email = " + "'" + localStorage.getItem('EmailLoggedIn') + "'"; 
   
    conn.query( sqlQuery, function(err, result) {
        if (err) {
            console.log("query error"); 
            console.log(err); 
        } else {
            console.log("got info successfully"); 
            // result = JSON.stringify(result); 
            console.log(result[0]); 
            firstName = result[0].First_name; 
            console.log(firstName); 
            lastName = result[0].Last_name; 
            email = result[0].Email; 
        }

    });
    
    var sqlQuery2 = "SELECT ProfilePicPath FROM ProfilePics WHERE Email = " + "'" + localStorage.getItem('EmailLoggedIn') + "'"; 
    
    conn.query( sqlQuery2, function(err, result) {
        if (err) {
            console.log("query error"); 
            console.log(err); 
        } else {
            
            console.log(result); 
            profilePicPath = result[0].ProfilePicPath; 
            console.log("profile pic path ----->"); 
            console.log(profilePicPath); 
            
            var filePath = '/secretPage.html';

            filePath = __dirname+filePath;
            var extname = path.extname(filePath);
            var contentType = 'text/html';

            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
            }       

            fs.exists(filePath, function(exists) {
                
                if (exists) {
                    console.log("file exists"); 
                    fs.readFile(file, function(err, data) {
                        if ( err) {
                        res.writeHead(500);
                        res.end();
                        console.log("error reading file"); 
                    }
                    else { // read file 
                        CollectMemories(); 
                        var memData = JSON.stringify(memories); 

                        console.log("reading file"); 
                        data = data.toString('utf8');
                        res.writeHead(200, { 'Content-Type': contentType });
                        data = data.replace('{{_firstName}}', firstName);
                        data = data.replace('{{_lastName}}', lastName); 
                        data = data.replace('{{_email}}', email); 
                        data = data.replace('{{_memories}}', memories);
                        console.log("profile pic path " + profilePicPath);   
                        data = data.replace('{{_profilePicPathJs}}', profilePicPath); 
                        res.write(data);
                        res.end(); 
                        }
                    }); 
                }
            });
            
        } // query successful 
        conn.end(); 
    }); // query call 
    
    } // logged in -> END 
    else { 
        console.log("profile request - NOT logged in");
        res.redirect('login'); 
        
    } 
});


function serve_login(filePath, res) {

 filePath = '/login.html';

    filePath = __dirname+filePath;
    var extname = path.extname(filePath);
    var contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.exists(filePath, function(exists) {
   
        if (exists) {
            fs.readFile(filePath, function(error, data) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {    // Read file 
                    data = data.toString('utf8'); 
                    res.writeHead(200, { 'Content-Type': contentType });
                    if ( loginError ) {
                        data = data.replace('{{_loginError}}', 'Incorrect Email or Password');
                    } else {
                        data = data.replace('{{_loginError}}', ''); 
                    }
                    
                    data = data.replace('{{_emailError}}', '');
                    data = data.replace('{{_passwError}}', '');
                    res.write(data);
                    res.end();
              //    res.end(content, 'utf-8');                  
                }
            });
        }
    });

}


app.get('/login', function(req,res) {
    console.log("login request"); 
    if ( localStorage.getItem('LoggedIn') == 'false') {
        console.log("login request -> not logged in");
        loginError = false; 
        serve_login('login.html',res); 
    }
    
    else {
        console.log("login request -> logged in"); 
        res.redirect('/profile'); 
    }
}); // get login -> END


app.post('/logVal', function(req,res) {
    console.log("app getting login validation"); 
    validate_login(req,res); 
});


app.post('/logout', function(req,res) {
    
    console.log("picked up logout request"); 
    localStorage.setItem('LoggedIn', 'false'); 
    res.redirect('login');
});


function validate_login(req, res) {
    
    console.log("looking at login data"); 
    
    var queryData = "";
    var postData = ""; 
    
    req.on('data', function(data) {
        queryData += data; 
    });
    
    req.on('end', function() {
        postData = qs.parse(queryData); 

    var connection = mysql.createConnection({
    host : 'localhost',
    user : 'connor',
    password : '10Superstar',
    database : 'MyDB2'
    });
    
    connection.connect(function(err) {
        if (err) {
            console.log("connection error"); 
        } else {
            console.log("connection successful for login"); 
        }
    }); 
    
    var sqlQuery = "SELECT password FROM Accounts WHERE Email = " + "'" + postData.email + "'"; 
    var sqlQuery2 = "SELECT * FROM Accounts WHERE Email = " + "'" + postData.email + "'"; 
    
    connection.query(sqlQuery, function(err, result) {
        connection.end();
        if (err) {
            console.log("Query Error");
            console.log(err); 
        } else { 
           result = JSON.stringify(result); 
           console.log(result); 
           result = result.replace('password',''); 
           result = result.replace(/\W/g, '');
           
           // console.log(result); 
           var passwEnc = result;
           var passwDec = md5 (postData.passw);  
           console.log("password enc " + passwEnc); 
           console.log("password dec " + passwDec); 
          
          if ( passwEnc == passwDec ) {
              console.log("enc matches dec"); 
          }
           
           if ( passwEnc == passwDec ) { // Login successful 
               console.log("login successful"); 
               var emailLoggedIn = postData.email; 
               localStorage.setItem('EmailLoggedIn', emailLoggedIn); 
               localStorage.setItem('LoggedIn', 'true'); 
               res.redirect('profile'); 
           } else {
               console.log("login unsuccessful"); 
               loginError = true;  
               serve_login("login.html", res); 
           }
        }
    });
  }); // req on -> END   
} // validate login() -> END


app.get('/createAccount', function(req,res) {
    console.log("request - create account"); 
    
     ca_fnameError = "";
     ca_lnameError = "";
     ca_emailError = ""; 
     ca_passwError = ""; 
     ca_passwConfirmError = ""; 
    
    var file = "createAccount.html"; 
    fs.readFile(file, function(err, data) {
        data = data.toString('utf8'); 
        data = data.replace('{{_fnameError}}', ca_fnameError); 
        data = data.replace('{{_lnameError}}', ca_lnameError); 
        data = data.replace('{{_emailError}}', ca_emailError);
        data = data.replace('{{_passwError}}', ca_passwError); 
        data = data.replace('{{_passwConfirmError}}', ca_passwConfirmError); 
        res.writeHead(200, {'Content-type': 'text/html'}); 
        res.write(data);
        res.end();
    });
});


app.post('/createAccCheck', function(req,res) {
    
    console.log("looking at create account data"); 
    
    var queryData = "";
    var postData = ""; 
    
        req.on('data', function(data) {
            queryData += data; 
        });
        
        req.on('end', function() {
            postData = qs.parse(queryData); 
            
            if ( postData.fname == "" ) {
                console.log("failed validation - no first name"); 
                ca_fnameError = " * Enter first name";
                serve_createAccount("createAccount.html", res); 
            }
            else if ( postData.lname == "" ) {
                console.log("failed validation - no last name"); 
                ca_lnameError = " * Enter last name"; 
                serve_createAccount("createAccount.html", res); 
            }
            else if ( postData.email == "" ) {
                console.log("failed validation - no email address"); 
                ca_emailError = " * Enter email address"; 
                serve_createAccount("createAccount.html", res); 
            }
            else if ( postData.passw == "" ) {
                console.log("failed validation - no password"); 
                ca_passwError = " * Enter password"; 
                serve_createAccount("createAccount.html", res); 
            } 
            else { // no empty fields 
                
                console.log("password " + postData.passw ); 
                console.log("confirm password " + postData.passConfirm); 
                
                var passw = postData.passw;
               
               if ( passw.length >= 3 ) { // password is long enough - continue validation
                   
                if ( postData.passw != postData.passwConfirm ) {
                    console.log("password confirmation error"); 
                    ca_passwConfirmError = " * password is not confirm"; 
                    serve_createAccount("createAccount.html", res); 
                }
                
                else { // password matches
                    
                    console.log("create account - passed 'all fields filled' validation"); 
            
                    // connect
                    var connection = mysql.createConnection({
                        host : 'localhost',
                        user : 'connor',
                        password : '10Superstar',
                        database : 'MyDB2' 
                    });
                
                    // check connection
                    connection.connect(function(err) {
                        if (err) {
                            console.log("connection error"); 
                        } else {
                            console.log("connection successful"); 
                        }
                    });
                    
                // email validation
                var email = postData.email; 
                console.log(email); 
                
                var atPos = email.indexOf("@");
                var dotPos = email.lastIndexOf("."); 
                if ( atPos < 1 || dotPos < atPos + 2 || dotPos + 2 >= email.length ) {
                    console.log("invalid email address"); 
                    ca_emailError = " * Invalid email address";  
                    serve_createAccount("createAccount.html", res); 
                } else { 
                    console.log("email address is valid"); 

                // check email is not already in use
                var emailCheckQuery = "SELECT * FROM Accounts WHERE Email = '" + postData.email + "'"; 
                connection.query( emailCheckQuery, function(err, result) {
                    if (err) {
                        console.log("email query error"); 
                    } else {
                        console.log("check for email current existance"); 
                        console.log( emailCheckQuery ); 
                        
                        result = JSON.stringify(result); 
                        result = result.replace(/\W/g, '');
                        var emailResult = result;
                
                        if ( emailResult == "" ) { // passed validation
                            console.log("passed email validation - adding account to table"); 
                            
                            // insert account
                             var passwEnc = md5(postData.passw); 
                             var sqlQuery = "INSERT INTO Accounts(First_name, Last_name, Email, Password)" +
                                        "VALUES ('" + postData.fname + "','" + postData.lname + "','" + postData.email + "','" + passwEnc + "' )"; 
                                        
                             // console.log(sqlQuery); 
                             connection.query( sqlQuery, function(err) { 
                                if (err) {
                                    console.log("Query Error");
                                    console.log(err); 
                                } else {
                                    console.log("Inserted Account into Database Successfully");
                                }
                            }); // insert account -> END
                            
                             var sqlQuery2 = "INSERT INTO ProfilePics(Email, ProfilePicPath)" +
                               "VALUES ( '" + postData.email + "','uploads/default_pp.jpg' )"; 
          
                             connection.query( sqlQuery2, function(err) {
                                if (err) {
                                    console.log("Query 2 Error"); 
                                    console.log(err); 
                                } else {
                                    console.log("Insert PP into Database Successfully"); 
                                }
                                    connection.end(); 
                                }); // inser profile pic -> END
                                
                                serve_createAccSuccess(req, res, 'createAccSuccess.html', postData); 
                            
                         } else {
                            ca_passwError = " * Email address already in use"; 
                            serve_createAccount("createAccount.html", res); 
                        }
                    } // email check - no error -> END
                });  // email check sql query -> END
                
                } // valid email address -> END
             } // confirm password -> END


              } // password >= 3 -> END 
              else {
                  console.log("password not long enough"); 
                  ca_passwError = " * password must be at least 3 characters long"; 
                  serve_createAccount("createAccount.html", res); 
              }
               
           } // no empty fields -> END
            
        }); // req end -> END
    
}); // function() -> END


/*
function content_type_for_path(file) {
    
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return "text/css";
    }
}
*/ 


function serve_createAccSuccess(req, res, file, postData) {
    
    console.log('made it to function without error') ;
    fs.readFile(file, function(err, data) {
        console.log("reading file within function"); 
        data = data.toString('utf8'); 
        data = data.replace('{{_fname}}', postData.fname); 
        data = data.replace('{{_lname}}', postData.lname); 
        res.writeHead(200, {'Content-type': 'text/html'}); 
        res.write(data); 
        res.end(); 
    });
}


app.listen(8080); 
console.log("app listening on port 8080"); 
