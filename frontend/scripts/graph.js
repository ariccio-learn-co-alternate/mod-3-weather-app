function datasetFromResponse(response, label, key) {
    const dataset = {
        label: label,
        backgroundColor: 'black',
        borderColor: 'black',
        data: response.results.map(result => result[key]),
        fill: false
    }
    return dataset;
}

function axesWithLabel(label) {
    const axe = {
        display: true,
        scaleLabel: {
            display: true,
            labelString: label
        }
    }
    return axe;
}

function chartConfig(response) {
    // based on sample code: https://github.com/chartjs/Chart.js/blob/master/samples/charts/line/basic.html
    const config = {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [
                datasetFromResponse(response, 'temperatures', 'mean_temp')
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: `Data for ${response.meta.noaa_id}`
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                xAxes: [axesWithLabel('month')],
                yAxes: [axesWithLabel('temperature')]
            }
        }
    };
    return config;
}

function renderYear(response) {
    console.log(response);
    slapYearDataOnDOM(response);
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response));
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response));
    }
}



function graphCanvas2dCtx() {
    const graphCanvas = document.getElementById("graph-canvas");
    const graphCanvasCtx = graphCanvas.getContext('2d');
    return graphCanvasCtx;
}