const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/contributors', require('./routes/contributorRoutes'));
app.use('/api/mosques', require('./routes/mosqueRoutes'));

module.exports = app;
