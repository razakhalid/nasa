const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');


const DEFAULT_FLIGHT_NUMBER = 100;

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, {
            '_id': 0,
            '__v': 0
        })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    },
                    strictPopulate: false
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    },
                    strictPopulate: false
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const {
            flight_number,
            name,
            rocket,
            date_local,
            upcoming,
            success,
            payloads
        } = launchDoc;

        const launch = {
            flightNumber: flight_number,
            mission: name,
            rocket: rocket.name,
            launchDate: date_local,
            upcoming,
            success,
            customers: payloads.flatMap(payload => payload.customers)
        }

        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunches();
    }
}

async function addNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if (!planet) throw new Error('No matching planet found');
    const newLaunch = {
        ...launch,
        success: true,
        upcoming: true,
        customers: ["ZTM", "NASA"],
        flightNumber: await getLatestFlightNumber() + 1
    }
    await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function existsLaunchWithId(id) {
    return await findLaunch({
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
    loadLaunchData,
    existsLaunchWithId,
    abortLaunchById
};