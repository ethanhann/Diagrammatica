'use strict';
/* check: false */
/* exported scrollPosition */

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
