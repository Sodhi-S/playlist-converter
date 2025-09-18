const express = require('express');
const app = express();

app.use('/auth/spotify', require('./auth/spotify'));
app.use('/auth/soundcloud', require('./auth/soundcloud'));
app.use('/playlist/spotify', require('./playlist/spotify'));
app.use('/playlist/soundcloud', require('./playlist/soundcloud'));
app.use('/convert', require('./convert'));

module.exports = app;
