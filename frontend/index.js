"use strict";
const BASE_SERVER_PATH = "http://localhost:3000";
const BASE_YOUR_STATION_ID = "your-station";
const INPUT_BOX_CLASS = "input-box";
const YEAR_INPUT_BOX_FORM_ID = "year-input-box-form";
const MONTHLY_DATA_TABLE_ID = "monthly-data-table";
const MONTHLY_DATA_TABLE_WRAPPER = "monthly-data-table-wrapper";

function createCity(station) {
    const cityP = document.createElement("p");
    cityP.innerText = `City: ${station.city}`;
    cityP.id = `${BASE_YOUR_STATION_ID}-city`;
    return cityP;
}

function createState(station) {
    const stateP = document.createElement("p");
    stateP.innerText = `State: ${station.state}`;
    stateP.id = `${BASE_YOUR_STATION_ID}-state`;
    return stateP;
}

function createStationID(station) {
    const stationIDP = document.createElement("p");
    stationIDP.innerText = `station ID: ${station.id}`;
    stationIDP.id = `${BASE_YOUR_STATION_ID}-id`;
    return stationIDP;
}

function createStationLat(station) {
    const latP = document.createElement("p");
    latP.innerText = `Station latitude: ${station.latitude}`;
    latP.id = `${BASE_YOUR_STATION_ID}-lat`;
    return latP;
}

function createStationLong(station) {
    const longP = document.createElement("p");
    longP.innerText = `Station longitude: ${station.longitude}`;
    longP.id = `${BASE_YOUR_STATION_ID}-long`;
    return longP;
}

function createStationNOAAID(station) {
    const noaaIDP = document.createElement("p");
    noaaIDP.innerText = `noaa_id: ${station.noaa_id}`;
    noaaIDP.id = `${BASE_YOUR_STATION_ID}-noaa-id`;
    return noaaIDP;
}

function renderStationSubDiv(station) {
    const newDiv = document.createElement("div");
    newDiv.id = `${BASE_YOUR_STATION_ID}-data`;


    // Example data:
    // city: "Westchester Co Airport"
    // created_at: "2019-07-29T18:14:59.267Z"
    // id: 108
    // latitude: 41.06694
    // longitude: -73.7075
    // noaa_id: "GHCND:USW00094745"
    // state: "NY"
    // updated_at: "2019-07-29T18:14:59.267Z"

    // Station location data:
    newDiv.appendChild(createCity(station));
    newDiv.appendChild(createState(station));
    newDiv.appendChild(createStationID(station));
    newDiv.appendChild(createStationLat(station));
    newDiv.appendChild(createStationLong(station));
    newDiv.appendChild(createStationNOAAID(station));

    return newDiv;
}

function renderYearInputBox(station) {
    const oldForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    oldForm.hidden = false;
    oldForm.dataset.noaa_id = station.noaa_id;
}

function appendStationInfo(station) {
    const stationDataDiv = document.querySelector("#station-data");
    stationDataDiv.innerHTML = "";
    stationDataDiv.appendChild(renderStationSubDiv(station));

    // precipitation,
    // snow,
    // average temp
    // max temp
    // min temp

    renderYearInputBox(station);
}

function fetchStationURL(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    return `${BASE_SERVER_PATH}/stations/${btoa(JSON.stringify(body))}`
}

function mapClick(event) {
    fetch(fetchStationURL(event))
        .then(res => res.json()).then(response => {
            console.log(response);
            appendStationInfo(response);
        })
}

function fetchYearURL(target, userYear) {
    // noaa_id : ...
    // year : ...
    const body = {
        noaa_id: target.dataset.noaa_id,
        year: userYear
    };
    return `${BASE_SERVER_PATH}/weather/${btoa(JSON.stringify(body))}`;
}

function findOldTableAndEmptyOrCreateEmptyTable(id, div) {
    const table = document.querySelector(`#${id}`);
    if (!table) {
        const newTable = document.createElement("table");
        newTable.className = 'table table-dark table-hover smushed-table'
        newTable.id = id;
        const divToAddTo = document.querySelector(`#${div}`);
        divToAddTo.appendChild(newTable);
        return newTable;
    }
    table.innerHTML = "";
    return table;
}

function newTableHeader(headerText) {
    const newThead = document.createElement("thead");
    const newTR = document.createElement("tr");
    const newTH = document.createElement("th");
    newTH.innerText = headerText;
    newTH.colSpan = 3;
    newTH.className = 'thead'

    newTR.appendChild(newTH);
    newThead.appendChild(newTR);
    return newThead;
}


function topRow() {
    const headerTR = document.createElement("tr");
    const monthTH = document.createElement("th");
    monthTH.innerText = "Month";
    headerTR.appendChild(monthTH);

    const tempTH = document.createElement("th");
    tempTH.innerText = "Average temperature (\xB0F)";
    headerTR.appendChild(tempTH);

    const precipTH = document.createElement("th");
    precipTH.innerText = "Total precipitation (in.)";
    headerTR.appendChild(precipTH);

    const snowTH = document.createElement("th");
    snowTH.innerText = "Total snow (in.)";
    headerTR.appendChild(snowTH);

    return headerTR;
}

function createRow(tr, rowData) {
    const monthTd = document.createElement("td");
    monthTd.innerText = rowData["month"];
    tr.appendChild(monthTd);

    const tempTd = document.createElement("td");
    tempTd.innerText = rowData["mean_temp"];
    tr.appendChild(tempTd);

    const precipTd = document.createElement("td");
    precipTd.innerText = rowData["total_precip"];
    tr.appendChild(precipTd);

    const snowTd = document.createElement("td");
    snowTd.innerText = rowData["total_snow"];
    tr.appendChild(snowTd);
}


function slapYearDataOnDOM(response) {
    const table = findOldTableAndEmptyOrCreateEmptyTable(MONTHLY_DATA_TABLE_ID, MONTHLY_DATA_TABLE_WRAPPER);
    const tHead = newTableHeader(`Monthly data for year ${response.meta.year}`)
    table.appendChild(tHead);

    tHead.appendChild(topRow());

    const tBody = document.createElement("tbody");
    for (let i = 0; i < response.results.length; i++) {
        const newTR = document.createElement("tr");
        createRow(newTR, response.results[i]);
        newTR.className = "smushed-row"
        tBody.appendChild(newTR);
    }
    table.appendChild(tBody);
}

function yearFormHandler(event) {
    event.preventDefault();
    const userYear = parseInt(event.target.year.value);
    console.log(`user wants data for year ${userYear}`);
    fetch(fetchYearURL(event.target, userYear)).then(res => res.json()).then(response => {
        console.log(response);
        slapYearDataOnDOM(response);
    })
}

// I know it's not C++, don't @ me bro.
function main() {
    const yearForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    yearForm.addEventListener('submit', yearFormHandler);
}

main();
