'use strict';
/* check: false */
/* exported scrollPosition, isD3Selection */

function scrollPosition() {
    if (typeof window.scrollX === 'number' && typeof window.scrollY === 'number') {
        return {x: window.scrollX, y: window.scrollY};
    }

    if (typeof window.pageXOffset === 'number' && typeof window.pageYOffset === 'number') {
        return {x: window.pageXOffset, y: window.pageYOffset};
    }

    var doc = document.documentElement || document.body.parentNode;
    if (typeof doc.ScrollLeft !== 'number' || typeof doc.ScrollTop !== 'number') {
        doc = document.body;
    }
    return {x: doc.scrollLeft, y: doc.scrollTop};
}

function isD3Selection(value) {
    // The second half of the statement is for IE9 compatibility.
    // See: http://stackoverflow.com/a/25024739/2832321
    return value instanceof d3.selection || (check.array(value) && typeof value[0] !== 'string');
}
