'use strict';
/* exported toCSV */
/* global check */
/* Attribution: http://jsfiddle.net/hybrid13i/JXrwM/ */
var toCSV = function (json, reportTitle, showHeader) {
    //If json is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = check.object(json) ? JSON.parse(json) : json;
    var csv = showHeader ? Object.keys(arrData[0]).join() + '\r\n' : '';

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = '';
        //2nd loop will extract each column and convert it in string comma-separated
        for (var j in arrData[i]) {
            if (arrData[i].hasOwnProperty(j)) {
                row += '"' + arrData[i][j] + '",';
            }
        }
        row.slice(0, row.length - 1);
        //add a line break after each row
        csv += row + '\r\n';
    }

    var fileName = 'export';
    if (check.string(reportTitle)) {
        fileName = reportTitle.replace(/ /g, '_');
    }
    var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

    // Hack to allow the file to be downloaded...
    // Generate a temp <a /> tag remove it right away.
    var link = document.createElement('a');
    link.href = uri;
    link.style = 'visibility:hidden';
    link.download = fileName + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
