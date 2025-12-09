const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());


const songs = [
    {
        id: 1,
        title: "See You Again",
        artist: "Wiz Khalifa",
        year: 2015
    },
    {
        id: 2,
        title: "Despacito",
        artist: "Luis Fonsi",
        year: 2017
    },
    {
        id: 3,
        title: "Shape of You",
        artist: "Ed Sheeran",
        year: 2017
    }
];


app.use(express.static(path.join(__dirname, 'client')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'home.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'home.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'home.html'));
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



