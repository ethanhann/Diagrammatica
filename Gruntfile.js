'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        settings: {
            src: 'src',
            dist: 'dist',
            libName: 'diagrammatica',
            angularModuleName: 'diagrammatica-angular-module'
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
                tasks: [
                    'uglify:beautifyLibrary',
                    'uglify:minifyLibrary',
                    'uglify:beautifyAngularModule',
                    'uglify:minifyAngularModule',
                    'sass:dist'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            beautifyLibrary: {
                files: {
                    '<%= settings.dist %>/<%= settings.libName %>.js': ['<%= settings.src %>/js/*.js']
                },
                options: {
                    wrap: '<%= settings.libName %>',
                    exportAll: true,
                    compress: false,
                    mangle: false,
                    beautify: true
                }
            },
            minifyLibrary: {
                files: {
                    '<%= settings.dist %>/<%= settings.libName %>.min.js': ['<%= settings.src %>/js/*.js']
                },
                options: {
                    wrap: '<%= settings.libName %>',
                    exportAll: true,
                    sourceMap: true
                }
            },
            beautifyAngularModule: {
                files: {
                    '<%= settings.dist %>/<%= settings.angularModuleName %>.js': ['<%= settings.src %>/angular-module/*.js']
                },
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true
                }
            },
            minifyAngularModule: {
                files: {
                    '<%= settings.dist %>/<%= settings.angularModuleName %>.min.js': ['<%= settings.src %>/angular-module/*.js']
                },
                options: {
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
        'uglify:beautifyLibrary',
        'uglify:minifyLibrary',
        'uglify:beautifyAngularModule',
        'uglify:minifyAngularModule'
    ]);

    grunt.registerTask('test', [
        'jshint:src',
        'karma:unit'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
