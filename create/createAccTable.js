var express = require('express'); 
var mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'connor',
    password : '10Superstar',
    database : 'MyDB2'
}); 
var app = express(); 

connection.connect(function(err) {
    if (!err) {
        console.log("connection successful"); 
    } else {
        console.log('error connecting'); 
    }
});

app.get("/createTable", function(req,res) {
    
    console.log("create table request"); 
    
    
    var accountsSqlQuery = 'CREATE TABLE Accounts (Account_id int, First_name VARCHAR(100),' +
                           'Last_name VARCHAR(100), Email VARCHAR(100), password VARCHAR(255), PRIMARY KEY(Account_id) )';
                     
    var ppSqlQuery = "CREATE TABLE ProfilePics (Account_id int, Email VARCHAR(100), ProfilePicPath VARCHAR(255)," +
                     "PRIMARY KEY(Account_id) )";
    
   connection.query(ppSqlQuery, function(err, result) {
        if (err) {
            console.log(err); 
        } 
        else {
            console.log("Table Accounts Created");
        }
         //   connection.end();
    });  

    
   // connection.end
});

console.log("listening at port 8080"); 
app.listen(8080); 