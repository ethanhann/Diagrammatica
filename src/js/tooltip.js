'use strict';
/* check: false */
/* exported tooltip */

var tooltip = d3.select('body').append('div')
    .attr('class', 'diagrammatica-tooltip')
    .style('opacity', 0);

document.addEventListener('mousemove', function (event) {
    if (!d3.select(event.toElement).classed('diagrammatica-tooltip-target')) {
        tooltip.style('opacity', 0);
    }
});
