/*
 * grunt-concat-angular
 * https://github.com/mrussell/grunt-pseudolocalize
 *
 * Copyright (c) 2014 Marcus Russell
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	'use strict';
	var _ = require('lodash'),
	defaults = {
		pad: 0,
		pretty: true
	},
	pseudoUpper = [
		'\u0102', //A - 65
		'\u00DF', //B - 66
		'\u0108', //C - 67
		'\u010E', //D - 68
		'\u01A9', //E - 69
		'\u0191', //F - 70
		'\u0193', //G - 71
		'\u0124', //H - 72
		'\u0128', //I - 73
		'\u0135', //J - 74
		'\u040C', //K - 75
		'\u00A3', //L - 76
		'\u028D', //M - 77
		'\u019D', //N - 78
		'\u01D1', //O - 79
		'\u01A4', //P - 80
		'\u01EC', //Q - 81
		'\u01A6', //R - 82
		'\u01A7', //S - 83
		'\u04AC', //T - 84
		'\u01D3', //U - 85
		'\u0476', //V - 86
		'\u019C', //W - 87
		'\u0416', //X - 88
		'\u00A5', //Y - 89
		'\u01B5'  //Z - 90
	],
	pseudoLower = [
		'\u0103', // a - 97
		'\u0253', // b - 98
		'\u0109', // c - 99
		'\u0257', // d - 100
		'\u0259', // e - 101
		'\u0192', // f - 102
		'\u0260', // g - 103
		'\u0267', // h - 104
		'\u0268', // i - 105
		'\u0135', // j - 106
		'\u0137', // k - 107
		'\u013C', // l - 108
		'\u0271', // m - 109
		'\u019E', // n - 110
		'\u01D2', // o - 111
		'\u03C1', // p - 112
		'\u01A3', // q - 113
		'\u027E', // r - 114
		'\u0161', // s - 115
		'\u01AD', // t - 116
		'\u028A', // u - 117
		'\u028B', // v - 118
		'\u026F', // w - 119
		'\u03F0', // x - 120
		'\u0263', // y - 121
		'\u0290'  // z - 122
	];

	function pseudo(val, pad) {
		var code = 0,
			output = '';

		if (val) {
			for (var i = 0; i < val.length; i += 1) {
				code = val.charCodeAt(i);
				if (code > 64 && code < 91) { // uppercase
					code -= 65;
					output += pseudoUpper[code];
				} else if (code > 96 && code < 123) { // lowercase
					code -= 97;
					output += pseudoLower[code];
				} else {
					output += val.charAt(i);
				}
			}
			if (pad) {
				var xtra = Math.round(output.length * pad);
				output += new Array(xtra + 1).join('x');
			}
		}
		return output;
	}

	grunt.registerMultiTask('pseudolocalize',
		'Pseudolocalize English JSON key-value locale file for testing purposes.', function() {
		var options = this.options(defaults);

		if (Number.isNaN(options.pad) || (options.pad < 0 || options.pad > 1)) {
			grunt.fatal("Optional 'pad' setting must be a number between 0 and 1 representing " +
			"percentage of input string\nlength to increase by (e.g. 0.25 adds 25% length.");
		}

		this.files.forEach(function(file) {

			if (file.dest) {

				var sourceFilenames = file.src.filter(function(filepath) {
					// Warn on and remove invalid source files (if nonull was set).
					if (!grunt.file.exists(filepath)) {
						grunt.warn('Source file "' + filepath + '" not found.');
						return false;
					} else {
						return true;
					}
				});
				var numFiles = sourceFilenames.length;
				if (numFiles <= 0) {
					grunt.warn.writeln('No source files found.');
					return;
				}

				grunt.verbose.ok('Loading source files...');
				var contents = {};
				for (var f = 0; f < numFiles; f += 1) {
					var json = JSON.parse(grunt.file.read(sourceFilenames[f]));
					_.extend(contents, json);
				}

				_.forOwn(contents, function(val, prop) {
					if (options.key) {
						val[options.key] = pseudo(val[options.key], options.pad);
					} else {
						val = pseudo(val, options.pad);
					}
					contents[prop] = val;
				});

				if (options.pretty) {
					grunt.file.write(file.dest, JSON.stringify(contents, null, 4));
				} else {
					grunt.file.write(file.dest, JSON.stringify(contents));
				}
				grunt.log.notverbose.ok('File "' + file.dest + '" written.');

			} else {

				grunt.warn('No destination supplied; nothing to do.');

			}

		});
	});

};