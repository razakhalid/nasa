const app = require('./app');
const http = require('http');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

require('dotenv').config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    try {
        await mongoConnect();
    } catch(err) {
        console.error('could not connect');
        console.error(err);
    }

    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });
}

startServer()