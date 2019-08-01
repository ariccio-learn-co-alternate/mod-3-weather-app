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

function chartConfig(response, graphDatatypeInput) {
    // based on sample code: https://github.com/chartjs/Chart.js/blob/master/samples/charts/line/basic.html
    let dataTypeString = graphDatatypeInput.replace('_', ' ');
    const config = {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [
                datasetFromResponse(response, dataTypeString, graphDatatypeInput)
            ]
        },
        options: {

            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Monthly data for ${response.meta.city}, ${response.meta.state}`
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
                yAxes: [axesWithLabel(dataTypeString)]
            }
        }
    };
    return config;
}

// function dailyChartConfig(response, graphDatatypeInput) {
//     // based on sample code: https://github.com/chartjs/Chart.js/blob/master/samples/charts/line/basic.html
//     let dataTypeString = graphDatatypeInput.replace('_', ' ');
//     const config = {
//         type: 'line',
//         data: {
//             labels: 1..response.length,
//             datasets: [
//                 datasetFromResponse(response, dataTypeString, graphDatatypeInput)
//             ]
//         },
//         options: {

//             responsive: true,
//             maintainAspectRatio: false,
//             title: {
//                 display: true,
//                 text: `Monthly data for ${response.meta.city}, ${response.meta.state}`
//             },
//             tooltips: {
//                 mode: 'index',
//                 intersect: false
//             },
//             hover: {
//                 mode: 'nearest',
//                 intersect: false
//             },
//             scales: {
//                 xAxes: [axesWithLabel('month')],
//                 yAxes: [axesWithLabel(dataTypeString)]
//             }
//         }
//     };
//     return config;
// }

function graphCanvas2dCtx() {
    const graphCanvas = document.getElementById("graph-canvas");
    const graphCanvasCtx = graphCanvas.getContext('2d');
    return graphCanvasCtx;
}