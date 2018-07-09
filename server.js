// a basic express app for serving the html & js
const express = require('express');
const app = express();

express.static.mime.types['wasm'] = 'application/wasm';

app.use(express.static('public'))
// app.use('js', express.static('js'));
// app.use('images', express.static('images'));

//app.get('/', (req, res) => res.send("hello"))

let server = app.listen(3000, () => console.log('html server listening on port 3000'));