require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// MUST come before any routes
app.use(cors());
app.use(express.json());   // <= parses JSON bodies

// Routes
app.use('/api/contributors', require('./routes/contributorRoutes'));
app.use('/api/mosques',      require('./routes/mosqueRoutes'));
app.use('/api/admin',        require('./routes/contributorAdmin'));
app.use('/api/notifications', require('./routes/notification'));


connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));