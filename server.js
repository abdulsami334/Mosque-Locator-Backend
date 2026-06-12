require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database Pehle karein
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());   

// Routes
app.use('/api/contributors', require('./routes/contributorRoutes'));
app.use('/api/mosques',      require('./routes/mosqueRoutes'));
app.use('/api/admin',        require('./routes/contributorAdmin'));
app.use('/api/notifications', require('./routes/notification'));

const PORT = process.env.PORT || 5000;

// Host '0.0.0.0' lazmi shamil karein
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});