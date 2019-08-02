"use strict";
const BASE_SERVER_PATH = "http://localhost:3000";
const BASE_YOUR_STATION_ID = "your-station";
const INPUT_BOX_CLASS = "input-box";
const YEAR_INPUT_BOX_FORM_ID = "year-input-box-form";
const MONTHLY_DATA_TABLE_ID = "monthly-data-table";
const MONTHLY_DATA_TABLE_WRAPPER = "monthly-data-table-wrapper";
const MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.",
    "Sep.", "Oct.", "Nov.", "Dec."];

//Gloal variables that need to be tracked across our code.
let chart = null;
let curStationMarker = null;
let curHighlightedMonthCell = null;

//The next 5 functions render information for the form that appears when the user clicks the map (yearly data form)
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

function renderStationSubDiv(station) {
    const newDiv = document.createElement("div");
    newDiv.id = `${BASE_YOUR_STATION_ID}-data`;

    const infoHeading = document.createElement('h3')
    infoHeading.innerText = "Station Info"
    newDiv.appendChild(infoHeading)
    newDiv.appendChild(createCity(station));
    newDiv.appendChild(createState(station));
    newDiv.appendChild(createStationLat(station));
    newDiv.appendChild(createStationLong(station));

    return newDiv;
}

//Unhides the yearly data form and keeps track of the station's unique ID
function renderYearInputBox(station) {
    const oldForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    oldForm.hidden = false;
    oldForm.dataset.noaa_id = station.noaa_id;
}

//Combines the above elements to create the yearly data form.
function appendStationInfo(station) {
    const stationDataDiv = document.querySelector("#station-data");
    stationDataDiv.innerHTML = "";
    stationDataDiv.appendChild(renderStationSubDiv(station));

    renderYearInputBox(station);
}

//Creates the URL for the fetch request to find the closest station.
function fetchStationURL(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    return `${BASE_SERVER_PATH}/stations/${btoa(JSON.stringify(body))}`;
}


// Generates the google maps marker for the closest station to the click
function makeStationMarker(response) {
    if (curStationMarker) {
        curStationMarker.setMap(null)
    }
    curStationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(response.latitude, response.longitude),
        map: map,
        title: 'Current Station',
        label: 'S'
    });
}

// Complex function for processing the user's click on the map. Fetches info on the closest station, erases the table and chart (if present), generates the station marker, and slaps the info on the closest station on the DOM.
function mapClick(event) {
    document.querySelector('#instructions-for-table').hidden = true
    fetch(fetchStationURL(event))
        .then(res => res.json()).then(response => {
            const chartHolder = document.querySelector('#monthly-data-table-wrapper')
            chartHolder.innerHTML = ""
            makeStationMarker(response)
            document.querySelector('#divider').hidden = false;
            if (chart) {
                chart.destroy()
                chart = null
                document.querySelector('#graph-canvas').innerHTML = ""
            }

            appendStationInfo(response);

        }
        ).catch(
            _ => alert("Internal server error. Whoops!")
        )

}

//Generates the URL needed for the fetch request in the previous function.
function fetchYearURL(target, userYear) {

    const body = {
        noaa_id: target.dataset.noaa_id,
        year: userYear
    };
    return `${BASE_SERVER_PATH}/weather/monthly/${btoa(JSON.stringify(body))}`;
}

// Called when user submits the form to the right of the map. Creates the table and chart.
function renderYear(response, graphDatatypeInput) {
    slapYearDataOnDOM(response);
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// Creates table. Called by renderYear().
function slapYearDataOnDOM(response) {
    const table = findOldTableAndEmptyOrCreateEmptyTable(MONTHLY_DATA_TABLE_ID, MONTHLY_DATA_TABLE_WRAPPER);

    table.appendChild(topRow(response.meta.year, response.meta.noaa_id));

    const tBody = document.createElement("tbody");

    const tempTR = document.createElement('tr')
    createTempRow(tempTR, response.results)
    tBody.append(tempTR)

    const precipTR = document.createElement('tr')
    createPrecipRow(precipTR, response.results)
    tBody.append(precipTR)

    const snowTR = document.createElement('tr')
    createSnowRow(snowTR, response.results)
    tBody.append(snowTR)
    table.appendChild(tBody);
}

// Finds an old table if present or makes a new one entirely (called by slapYearDataOnDom())
function findOldTableAndEmptyOrCreateEmptyTable(id, div) {
    const table = document.querySelector(`#${id}`);
    if (!table) {
        const newTable = document.createElement("table");
        newTable.className = 'table table-dark smushed-table';
        newTable.id = id;
        const divToAddTo = document.querySelector(`#${div}`);
        divToAddTo.appendChild(newTable);
        return newTable;
    }
    table.innerHTML = "";
    return table;
}


//Generates the top row of the table.
function topRow(year, noaa_id) {

    const headerTR = document.createElement("tr");
    const corner = document.createElement('th');
    corner.innerText = `Monthly Data for ${year}`
    corner.id = "table-corner"
    corner.addEventListener('click', function (e) {
        if (curHighlightedMonthCell != null) {
            curHighlightedMonthCell.className = ""
            curHighlightedMonthCell = null
            clearTableColor()
        }
        rerenderChart()
    })
    headerTR.appendChild(corner)
    MONTHS.forEach(
        function (month) {
            const header = document.createElement("th");
            header.innerText = month;
            header.dataset.monthNum = MONTHS.indexOf(month) + 1
            headerTR.appendChild(header)
        }
    )
    headerTR.dataset.noaaId = noaa_id
    headerTR.dataset.year = year
    headerTR.addEventListener('click', submitMonthData)
    return headerTR;
}

//The next three functions generate the rows in the table corresponding to mean_temp, total_precip, and total_snow.
function createTempRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Average temperature (\xB0F)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.mean_temp === undefined) {
                cell.innerText = "No Data"
            }
            else { cell.innerText = result.mean_temp }
            newTR.appendChild(cell)
        }
    )
}

function createPrecipRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Total precipitation (in.)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.total_precip === undefined) {
                cell.innerText = "No Data"
            }
            else { cell.innerText = result.total_precip }
            newTR.appendChild(cell)
        }
    )
}

function createSnowRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Total snowfall (in.)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.total_snow === undefined) {
                cell.innerText = "No Data"
            }
            else {
                cell.innerText = result.total_snow
            }
            newTR.appendChild(cell)
        }
    )
}


//Complex function that is called when the user clicks on the top row of the chart. Checks to see if the clicked-on cell is a mobth, and if so, highlights that column, makes a fetch request to the NOAA server for detailed data, and calls a function to render the new, more specific chart.
function submitMonthData(event) {
    const cell = event.target
    if (cell.dataset.monthNum != null) {

        if (curHighlightedMonthCell != null) {
            curHighlightedMonthCell.className = ""
            clearTableColor()
        }

        curHighlightedMonthCell = cell

        highlightCol(cell)

        const month = cell.dataset.monthNum
        const noaaId = cell.parentNode.dataset.noaaId
        const year = cell.parentNode.dataset.year
        const body = {
            noaa_id: noaaId,
            year: year,
            month: month
        };
        const url = `${BASE_SERVER_PATH}/weather/daily/${btoa(JSON.stringify(body))}`
        fetch(url).then(res => res.json()).then(dailyData => renderDailyChart(dailyData)).catch(
            _ => alert("NOAA sent back bad data. Try another location or time span.")
        )
    }

}

//The next two functions deal with highlighting a column when a user clicks a month.
function highlightCol(cell) {
    cell.className = "bg-primary"

    const tBody = document.querySelector('tbody')

    tBody.childNodes.forEach(
        function (row) {
            row.childNodes[cell.dataset.monthNum].className = "bg-primary"
        }
    )
}

function clearTableColor() {
    const tBody = document.querySelector('tbody')
    tBody.childNodes.forEach(
        function (row) {
            row.childNodes.forEach(
                function (cell) {
                    cell.className = ""
                }
            )
        }
    )
}

// Grabs the data from the yearly form and returns the chart to the zoomed out state.
function rerenderChart() {
    const yearForm = document.querySelector('#year-input-box-form')
    const graphDatatypeInput = yearForm.graph_datatype_input.value
    const userYear = parseInt(yearForm.year.value);
    fetch(fetchYearURL(yearForm, userYear)).then(res => res.json()).then(response => {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }).catch(
        _ => alert("NOAA sent back bad data. Try another location or time span.")
    )
}

// Zooms in the chart to its daily state.
function renderDailyChart(response) {
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), dailyChartConfig(response));
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), dailyChartConfig(response));
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// Generates the listener for the year form to the right of the map.
function main() {
    const yearForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    yearForm.addEventListener('submit', yearFormHandler);
}

// Called when the user submits the year form to the right of the map. Calls functions to render the table and un-hide the directions for how to use the table.
function yearFormHandler(event) {
    event.preventDefault();
    const userYear = parseInt(event.target.year.value);
    fetch(fetchYearURL(event.target, userYear)).then(res => res.json()).then(response => {
        renderYear(response, event.target.graph_datatype_input.value);
        const directions = document.querySelector('#instructions-for-table')
        directions.hidden = false;
    }).catch(
        _ => alert("NOAA sent back bad data. Try another location or time span.")
    )
}

main();
