const express = require('express');
const mysql = require('mysql');
const parser = require('body-parser');
const app = express();
const path = require('path');
const multer = require('multer');
const helpers = require('./helpers');
const { compile } = require('ejs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname, "./public")));
app.use(parser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "hbs")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "Project",
    multipleStatements: true
})
connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log("Connected")
    }
})

const port = process.env.PORT || 8000;
app.listen(port);
console.log("App is listening to port 8000");

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


app.post('/Developer', (req, res) => {
    var upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('image');
    upload(req, res, function (err) {

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        var email = req.body.email;
        var password = req.body.password;
        var name = req.body.name;
        var team_id = req.body.team_id;
        var dob = req.body.dob;

        connection.query("SELECT email FROM Developer WHERE email = ?", [email], async (error, results) => {
            if (error) {
                console.log(error);
            } if (results.length > 0) {
                return res.render('register',
                    { message: "Email already exists" })
            }
            if (password.length < 7) {
                return res.render('register',
                    { message: "Password should be atleast 7 characters" })
            }
            const secret = 'dhwani';
            const hash = await bcrypt.hash(password,10)
           console.log("Password",password+'\n'+"Encryptd Password",hash);
            
            let image = __dirname + req.file.filename;
            let sql = 'INSERT INTO Developer( image, name, dob , email, password, team_id) VALUES(?,?,?,?,?,?)'
            connection.query(sql, [image, name, dob, email, hash, team_id], (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(results);
                    return res.render('register',
                        { message: "User Registered" })
                }
            })
        })
    });
});


// Creating Join between Team And Developer
// let sql = 'SELECT * from Team JOIN Developer ON Team.id = Developer.team_id'
// connection.query(sql, (err, result, fields) => {
//     if (err) throw err;
//      console.log(result);
// });


// Fetching all team and relevant developer.
// let sql = 'SELECT Project.Team.name AS "Team Name", Project.Developer.name AS Name from Project.Team \
// JOIN Project.Developer \
// ON Project.Team.id = Project.Developer.team_id'
// connection.query(sql, (err, result, fields) => {
//     if (err) throw err;
//     // console.log(result);
// });


// Fetching User by email and his team also Sorted developer based on DOB.
// let sql = 'SELECT Project.Team.name AS "Team Name", Project.Developer.email AS Email, Project.Developer.dob AS DOB from Project.Team \
// JOIN Project.Developer ON \
// Project.Team.id = Project.Developer.team_id ORDER BY Project.Developer.dob'
// connection.query(sql, (err, result, fields) => {
//     if (err) throw err;
//     console.log(result);
// });



app.get('/Developer', (req, res) => {
    connection.query('SELECT * FROM Developer', [req.params.team_id], (err, rows, fields) => {
        if (!err) {
            console.log(rows);
            res.send(rows)
        } else {
            console.log(err);
        }
    })
})