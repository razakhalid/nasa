const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: "2030",
    destination: "Kepler-442 b",
    customer: [
        "NASA"
    ],
    upcoming: true,
    success: true
}

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
    return Array.from(launches.values())
}

function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(latestFlightNumber, {
        ...launch,
        upcoming: true,
        customers: ["ZTM", "NASA"],
        flightNumber: latestFlightNumber
    });
}

module.exports = {
    getAllLaunches,
    addNewLaunch
};