var http = require('http');
var fs = require('fs');
var url = require('url'); 
var qs = require('querystring'); 
var express = require('express');
var app = express(); 
app.use(express.static(__dirname)); 
var bodyParser = require('body-parser'); 
var mysql = require('mysql'); 
var path = require('path'); 
var multer = require('multer'); 
var photoName = ""; 
var passedValidation = false; 

var unameError = ""; 
var passwError = ""; 

var ca_fnameError = "";
var ca_lnameError = "";
var ca_emailError = ""; 
var ca_passwError = ""; 

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

 
function serve_createAccount(file, res) {
    
    fs.readFile(file, function(err, data) {
        data = data.toString('utf8'); 
        data = data.replace('{{_fnameError}}', ca_fnameError); 
        data = data.replace('{{_lnameError}}', ca_lnameError); 
        data = data.replace('{{_emailError}}', ca_emailError);
        data = data.replace('{{_passwError}}', ca_passwError); 
        res.writeHead(200, {'Content-type': 'text/html'}); 
        res.write(data);
        res.end();
    });
}


function validate_createAccount(req, res) {
    
    console.log("looking at create account data"); 
    serve_createAccSuccess(req, res, 'createAccSuccess.html', postData); 
    
    var queryData = "";
    var postData = ""; 
    
    if ( req.method == 'POST' ) {
        
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
            else { // passed validation 
                console.log("create account - passed validation"); 
                serve_createAccSuccess(req, res, 'createAccSuccess.html', postData); 
                
                // add account into database 
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
                        console.log("connection successful"); 
                    }
                });
                
                 var sqlQuery = "INSERT INTO Accounts(First_name, Last_name, Email, Password)" +
                               "VALUES ('" + postData.fname + "','" + postData.lname + "','" + postData.email + "','" + postData.passw + "')"; 
                console.log(sqlQuery); 
                connection.query( sqlQuery, function(err) {
                    if (err) {
                        console.log("Query Error");
                        console.log(err); 
                    } else {
                        console.log("Inserted Account into Database Successfully");
                    }
                });  
                
                // console.log("moving on to query 2"); 
                
                var sqlQuery2 = "INSERT INTO ProfilePics(Email, ProfilePicPath)" +
                               "VALUES ( '" + postData.email + "','uploads/default_pp.jpg' )"; 
                console.log(sqlQuery2); 
                connection.query( sqlQuery2, function(err) {
                    if (err) {
                        console.log("Query 2 Error"); 
                        console.log(err); 
                    } else {
                        console.log("Insert PP into Database Successfully"); 
                    }
                    
                     connection.end(); 
                });
               
            } // passed validation -> END
            
        }); // req end
    } // req post
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
                        console.log("reading file"); 
                        data = data.toString('utf8');
                        res.writeHead(200, { 'Content-Type': contentType });
                        data = data.replace('{{_firstName}}', firstName);
                        data = data.replace('{{_lastName}}', lastName); 
                        data = data.replace('{{_email}}', email); 
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

app.get('/logout', function(req,res) {
    console.log("got logout request"); 
    res.writeHead(301, {Location: 'login'} );
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
       //  console.log(result); 
           
           result = result.replace(/\W/g, '');
       //  console.log(result);
           
           if ( result == postData.passw ) { // Login successful 
               console.log("login successful"); 
               // res.sendFile(path.resolve("LoggedIn.html")); 
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
   // serve_createAccount(req,res); 
    var file = "createAccount.html"; 
    fs.readFile(file, function(err, data) {
        data = data.toString('utf8'); 
        data = data.replace('{{_fnameError}}', ca_fnameError); 
        data = data.replace('{{_lnameError}}', ca_lnameError); 
        data = data.replace('{{_emailError}}', ca_emailError);
        data = data.replace('{{_passwError}}', ca_passwError); 
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
            else { // passed validation 
                console.log("create account - passed validation"); 
                serve_createAccSuccess(req, res, 'createAccSuccess.html', postData); 
                
                // add account into database 
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
                        console.log("connection successful"); 
                    }
                });
                
                var sqlQuery = "INSERT INTO Accounts(First_name, Last_name, Email, Password)" +
                               "VALUES ('" + postData.fname + "','" + postData.lname + "','" + postData.email + "','" + postData.passw + "')"; 
                               
               // console.log(sqlQuery); 
                connection.query( sqlQuery, function(err) {
                //    connection.end(); 
                    if (err) {
                        console.log("Query Error");
                        console.log(err); 
                    } else {
                        console.log("Inserted Account into Database Successfully");
                    }
                });
                
                 console.log("moving on to query 2"); 
                
                var sqlQuery2 = "INSERT INTO ProfilePics(Email, ProfilePicPath)" +
                               "VALUES ( '" + postData.email + "','uploads/default_pp.jpg' )"; 
                console.log(sqlQuery2); 
                connection.query( sqlQuery2, function(err) {
                    if (err) {
                        console.log("Query 2 Error"); 
                        console.log(err); 
                    } else {
                        console.log("Insert PP into Database Successfully"); 
                    }
                    
                     connection.end(); 
                });
               
            } // passed validation -> END
            
        });
    
});


function content_type_for_path(file) {
    
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return "text/css";
    }
}


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
