const app = require('./app');
const http = require('http');
const mongoose = require('mongoose');
const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;
const MONGO_URL = 'mongodb+srv://raza:raza@cluster0.j4jxkuu.mongodb.net/?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

const server = http.createServer(app);

async function startServer() {

    try {
        mongoose.connect(MONGO_URL);
    } catch(err) {
        console.error('could not connect');
        console.error(err);
    }

    await loadPlanetsData();

    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });
}

startServer();