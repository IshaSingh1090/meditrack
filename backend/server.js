require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');

const app = express();

// ✅ Fixed CORS
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

app.get('/', (req, res) => {
  res.send('MediTrack Pro Backend Running...');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));

// ✅ Scheduler starts AFTER server is running
const startScheduler = require('./utils/expiryScheduler');
startScheduler();