'use strict';
/* global isD3Selection: false */
var ChartBase = function (selection, chartClass) {
    this.hasRenderedOnce = false;
    this.selection = isD3Selection(selection) ? selection : d3.select(selection);
    this.update = function () {
    };
    var config = {
        margin: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        },
        width: 480,
        height: 250,
        transitionDuration: 500
    };
    this.config = config;
    this.config.paddedWidth = function () {
        return config.width - config.margin.left - config.margin.right;
    };
    this.config.paddedHeight = function () {
        var paddedHeight = config.height - config.margin.top - config.margin.bottom;
        if (paddedHeight <= 0) {
            throw 'Padded height (' + paddedHeight + ') of chart should be greater than 0. Increase its height or decrease its top/bottom margin.';
        }
        return paddedHeight;
    };
    this.config.tooltipHtml = function () {
        return 'tooltip content';
    };

    this.svg = this.selection.append('svg')
        .attr('class', 'diagrammatica diagrammatica-' + chartClass)
        .attr('width', config.width)
        .attr('height', config.height);
    this.renderArea = this.svg.append('g')
        .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');
    this.updateDimensions = function () {
        this.svg.attr('width', config.width).attr('height', config.height);
        this.renderArea.attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')');
    };
    this.xScale = function () {
    };
    this.xAxis = function () {
    };
    this.yScale = function () {
    };
    this.yAxis = function () {
    };

    var standardColors = ['#FD7C6E', '#87A96B', '#78DBE2', '#1F75FE', '#A2A2D0', '#6699CC', '#0D98BA', '#7366BD', '#CD9575', '#FFA474', '#FAE7B5', '#9F8170', '#ACE5EE', '#DE5D83', '#CB4154', '#B4674D', '#FF7F49', '#EA7E5D', '#B0B7C6', '#FFFF99', '#00CC99', '#FFAACC', '#DD4492', '#1DACD6', '#BC5D58', '#DD9475', '#9ACEEB', '#FFBCD9', '#FDDB6D', '#2B6CC4', '#EFCDB8', '#6E5160', '#CEFF1D', '#71BC78', '#6DAE81', '#C364C5', '#CC6666', '#E7C697', '#FCD975', '#A8E4A0', '#95918C', '#1CAC78', '#1164B4', '#F0E891', '#FF1DCE', '#B2EC5D', '#5D76CB', '#CA3767', '#3BB08F', '#FEFE22', '#FCB4D5', '#FFF44F', '#FFBD88', '#F664AF', '#AAF0D1', '#CD4A4C', '#EDD19C', '#979AAA', '#FF8243', '#C8385A', '#EF98AA', '#FDBCB4', '#1A4876', '#30BA8F', '#C54B8C', '#1974D2', '#FFA343', '#BAB86C', '#FF7538', '#FF2B2B', '#F8D568', '#E6A8D7', '#414A4C', '#FF6E4A', '#1CA9C9', '#FFCFAB', '#C5D0E6', '#FDDDE6', '#158078', '#FC74FD', '#F78FA7', '#8E4585', '#7442C8', '#9D81BA', '#FE4EDA', '#FF496C', '#D68A59', '#714B23', '#FF48D0', '#E3256B', '#EE204D', '#FF5349', '#C0448F', '#1FCECB', '#7851A9', '#FF9BAA', '#FC2847', '#76FF7A', '#93DFB8', '#A5694F', '#8A795D', '#45CEA2', '#FB7EFD', '#CDC5C2', '#80DAEB', '#ECEABE', '#FFCF48', '#FD5E53', '#FAA76C', '#18A7B5', '#EBC7DF', '#FC89AC', '#DBD7D2', '#17806D', '#DEAA88', '#77DDE7', '#FFFF66', '#926EAE', '#324AB2', '#F75394', '#FFA089', '#8F509D', '#FFFFFF', '#A2ADD0', '#FF43A4', '#FC6C85', '#CDA4DE', '#FCE883', '#C5E384', '#FFAE42', '#EFDECD', '#000000'];
    this.colors = d3.scale.ordinal().range(standardColors);
};

ChartBase.prototype.axisLabelText = function (axisLetter, value) {
    var label = this.selection.select('.' + axisLetter + '.axis .label');
    if (check.undefined(value)) {
        return label.empty() ? '' : label.text();
    }
    label.text(value);
    return this.update;
};

ChartBase.prototype.yAxisLabelText = function (value) {
    return this.axisLabelText('y', value);
};

ChartBase.prototype.xAxisLabelText = function (value) {
    return this.axisLabelText('x', value);
};

ChartBase.prototype.setDimension = function (value, axisUpdateCallback, property) {
    if (check.undefined(value)) {
        return this.config[property];
    }
    this.config[property] = value;
    if (!check.undefined(axisUpdateCallback)) {
        axisUpdateCallback();
    }
    this.svg.attr(property, this.config[property]);
    this.updateDimensions();
    return this.update;
};

ChartBase.prototype.width = function (value, axisUpdateCallback) {
    return this.setDimension(value, axisUpdateCallback, 'width');
};

ChartBase.prototype.height = function (value, axisUpdateCallback) {
    return this.setDimension(value, axisUpdateCallback, 'height');
};

ChartBase.prototype.tooltipHtml = function (value) {
    if (!arguments.length) {
        return this.config.tooltipHtml();
    }
    this.config.tooltipHtml = value;
    return this.update;
};
