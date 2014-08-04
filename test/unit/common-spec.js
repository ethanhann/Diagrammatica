'use strict';

describe('common', function () {
    var fixture;

    beforeEach(function () {
        fixture = d3.select('body');
    });

    afterEach(function () {
        fixture.remove();
    });

    it('should return true for D3 selection', function () {
        var expected = true;

        var result = isD3Selection(fixture);

        expect(result).toEqual(expected);
    });

    it('should return false if not a d3 selection', function () {
        var expected = false;

        var result = isD3Selection('');

        expect(result).toEqual(expected);
    });
});
