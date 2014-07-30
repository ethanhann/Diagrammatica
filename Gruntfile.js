'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        settings: {
            src: 'src',
            dist: 'dist'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            src: [
                '<%= settings.src %>/{,*/}*.js'
            ]
        },
        watch: {
            src: {
                files: ['<%= settings.src %>/**/*.js'],
                tasks: ['uglify:minify'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            beautify: {
                files: {
                    '<%= settings.dist %>/d2c.js': ['<%= settings.src %>/**/*.js']
                },
                options: {
                    wrap: 'd2c',
                    exportAll: true,
                    compress: false,
                    mangle: false,
                    beautify: true
                }
            },
            minify: {
                files: {
                    '<%= settings.dist %>/d2c.min.js': ['<%= settings.src %>/**/*.js']
                },
                options: {
                    wrap: 'd2c',
                    exportAll: true,
                    sourceMap: true
                }
            }
        }
    });

    grunt.registerTask('dev', [
        'watch:src'
    ]);

    grunt.registerTask('dist', [
        'jshint:src',
        'uglify:beautify',
        'uglify:minify'
    ]);

    grunt.registerTask('default', [
        'dist'
    ]);
};
