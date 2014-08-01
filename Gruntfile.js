'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        settings: {
            src: 'src',
            dist: 'dist',
            libName: 'diagrammatica'
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
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        },
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= settings.src %>/css',
                    src: ['**/*.scss'],
                    dest: '<%= settings.dist %>',
                    ext: '.css'
                }]
            }
        },
        watch: {
            src: {
                files: ['<%= settings.src %>/**/*.*'],
                tasks: ['uglify:minify', 'sass:dist'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            beautify: {
                files: {
                    '<%= settings.dist %>/<%= settings.libName %>.js': ['<%= settings.src %>/**/*.js']
                },
                options: {
                    wrap: 'diagrammatica',
                    exportAll: true,
                    compress: false,
                    mangle: false,
                    beautify: true
                }
            },
            minify: {
                files: {
                    '<%= settings.dist %>/<%= settings.libName %>.min.js': ['<%= settings.src %>/**/*.js']
                },
                options: {
                    wrap: '<%= settings.libName %>',
                    exportAll: true,
                    sourceMap: true
                }
            }
        }
    });

    grunt.registerTask('dev', [
        'watch:src'
    ]);

    grunt.registerTask('build', [
        'sass:dist',
        'jshint:src',
        'uglify:beautify',
        'uglify:minify'
    ]);

    grunt.registerTask('test', [
        'karma:unit'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
