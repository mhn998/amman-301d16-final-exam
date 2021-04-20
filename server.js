'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };



// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Specify a directory for static resources
app.use(express.static('public'));

// define our method-override reference
app.use(methodOverride("_method"));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Use app cors
app.use(cors());


// Database Setup
const client = new pg.Client(options);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', handleHomePage);
app.post('/addCharacter', addCharacters);
app.get('/favorite-quotes', showSaved);
app.get('/favorite-quotes/:quote_id', viewDetails);
app.put('/update/:quote_id', updateDetails);
app.delete('/delete/:quote_id', deleteCharacters)





// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

function handleHomePage(req, res) {
    const url = `https://thesimpsonsquoteapi.glitch.me/quotes?count=10`;
    superagent.get(url).set('User-Agent', '1.0').then(results => {
        const apiData = results.body.map(element => {
            return new Character(element)
        })
        res.render('index', { data: apiData })
    })
}


function addCharacters(req, res) {
    const { quote, character, image, characterDirection } = req.body;
    console.log(req.body);
    const SQL = 'INSERT INTO characters(quote,character,image,characterDirection) VALUES($1,$2,$3,$4);';
    const values = [quote, character, image, characterDirection];
    client.query(SQL, values).then(results => {
        console.log(results.rows);
        res.redirect('/favorite-quotes')
    })
}


function showSaved(req, res) {
    const SQL = 'SELECT * FROM characters;';
    client.query(SQL).then(results => {
        res.render('favorites', { data: results.rows })
    })

}

function viewDetails(req, res) {
    const id = req.params.quote_id;
    console.log(id);
    const SQL = 'SELECT * FROM characters where id=$1;'
    const values = [id];
    client.query(SQL, values).then(results => {
        res.render('details', { item: results.rows[0] })
    })
}

function updateDetails(req, res) {
    const { quote, character, image, characterDirection } = req.body;
    const id = req.params.quote_id;
    const SQL = 'UPDATE characters SET quote=$1,character=$2,image=$3, characterDirection=$4 where id=$5 RETURNING id;'
    const values = [quote, character, image, , id];
    client.query(SQL, values).then(results => {
        res.redirect(`/favorite-quotes`)
    })
}

function deleteCharacters(req, res) {
    const id = req.params.quote_id;
    const SQL = 'DELETE FROM characters where id=$1;';
    const values = [id]
    client.query(SQL, values).then(results => {
        res.redirect('/favorite-quotes')
    })

}



// helper functions

function Character(data) {
    this.quote = data.quote;
    this.character = data.character
    this.image = data.image;
    this.characterDirection = data.characterDirection;
}








// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);