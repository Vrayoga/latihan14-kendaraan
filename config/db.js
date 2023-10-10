let mysql = require('mysql');

let connection = mysql.createConnection({
    host:"localhost",
    user : "root",
    password : "password",
    database : "latihan14",

})

connection.connect(function(error){
    if(!!error){
        console.log(error);
    }else{
        console.log('koneksi berhasil');
    }
});
module.exports = connection;