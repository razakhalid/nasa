const launches = require('./launches.mongo');
const planets = require('./planets.mongo');


const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: "January 2, 2030",
    target: "Kepler-62 f",
    customer: [
        "NASA"
    ],
    upcoming: true,
    success: true
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches() {
    return await launches.find({}, {
        '_id': 0,
        '__v': 0
    });
}

async function saveLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if (!planet) throw new Error('No matching planet found');

    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

saveLaunch(launch);

async function addNewLaunch(launch) {
    const newLaunch = {
        ...launch,
        success: true,
        upcoming: true,
        customers: ["ZTM", "NASA"],
        flightNumber: await getLatestFlightNumber() + 1
    }
    await saveLaunch(launch);
}

async function existsLaunchWithId(id) {
    return await launches.findOne({
        flightNumber: id
    });
}

async function abortLaunchById(id) {
    const aborted = await launches.updateOne({
        flightNumber: id,
    }, {
        upcoming: false,
        success: false
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById
};