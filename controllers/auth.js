const mysql = require('mysql');
const express = require('express');
const app = express();
const hbs = require('hbs')
var jwt = require("jsonwebtoken");
const decode = require('jwt-decode');
const bcrypt = require('bcrypt');

app.set("view engine", hbs);
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "Project",
    multipleStatements: true
});



// exports.register = (req, res) => {
//     console.log("euwfgt", req.body);
//     let first_name = req.body.first_name;
//     let last_name = req.body.last_name;
//     let date_of_joining = req.body.date_of_joining;
//     let dob = req.body.dob;
//     let department = req.body.department;
//     let email = req.body.email;
//     let passsword = req.body.passsword;
//     let confirmpassword = req.body.confirmpasssword;

// connection.query("SELECT email FROM EMPLOYEES WHERE email = ?", [email], async (error, results) => {
//     if (error) {
//         console.log(error);
//     } if (results.length > 0) {
//         return res.render('register',
//             { message: "Email already exists" })
//     } if (passsword.length < 7) {
//         return res.render('register',
//         { message: "Password should be atleast 7 characters" })
//     } else if (passsword !== confirmpassword) {
//         return res.render('register',
//             { message: "Passwords do not match" })
//     }
// })



//         let sql = 'INSERT INTO Employees( first_name, last_name, date_of_joining , dob , department, email, password) VALUES(?,?,?,?,?,?,?)'
//         connection.query(sql, [first_name, last_name, date_of_joining, dob, department, email, passsword], (err, results) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log(results);
//                 return res.render('register',
//                     { message: " User Registered " })
//             }
//         })
//     })

// }

exports.login = (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;

        connection.query("SELECT * FROM Developer WHERE email=?", [email], async (error, results) => {
            // console.log(results);

            let email = req.body.email;
            let password = req.body.password;
            //                  console.log(results[0].password)
            if (results.length == 0) {
                return res.render('login',
                    { message: "Invalid password or email" })
            }
            else if (await bcrypt.compare(password, results[0].password)) {

                const token = jwt.sign(
                    {
                        email: email,
                        password: password
                    },
                    "seceret",
                    {
                        expiresIn: "1h"
                    }
                );
                console.log("User Details", token); 
                return res.render('loggedin')
            }
            // }
            else {
                return res.render('login',
                    { message: "Invalid password or email" })
            }
        })
    } catch (err) {
        console.log(err);
    }
}

