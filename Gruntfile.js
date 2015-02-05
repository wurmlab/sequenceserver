module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        prefix: 'public/dist/',
        name: '<%= pkg.name.toLowerCase() %>',
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            main: {
                files: {
                    '<%= prefix %>/css/<%= name %>.min.css':
                        [
                            'public/css/bootstrap.min.css',
                            'public/css/font-awesome.min.css',
                            'public/css/custom.css'
                        ]
                }
            }
        },
        uglify: {
            options: {
            },
            main: {
                files: {
                    '<%= prefix %>/js/<%= name %>.min.js':
                        [
                            // Base.
                            'public/js/underscore.min.js',
                            'public/js/jquery.min.js',
                            'public/js/jquery-ui.min.js',
                            'public/js/bootstrap.min.js',
                            'public/js/webshims/polyfiller.js',

                            // d3 - for visualisation.
                            'public/js/d3.v3.min.js',

                            // Our stuff.
                            'public/js/sequence.js',
                            'public/js/sequenceserver.js',
                            'public/js/jquery.t.js',
                            'public/js/sequenceserver.blast.js',
                        ]
                }
            }
        },
        copy: {
            shims: {
                expand: true,
                cwd:    'public/js/webshims/shims/',
                src:    '**',
                dest:   '<%= prefix %>/js/shims/'
            },
            fonts: {
                expand: true,
                cwd:    'public/fonts/',
                src:    '**',
                dest:   '<%= prefix %>/fonts'
            }
        },
        compress: {
            options: {
                mode: 'gzip'
            },
            js: {
                files: {
                    '<%= prefix %>/js/<%= name %>.min.js.gz':
                        '<%= prefix %>/js/<%= name %>.min.js'
                }
            },
            css: {
                files: {
                    '<%= prefix %>/css/<%= name %>.min.css.gz':
                        '<%= prefix %>/css/<%= name %>.min.css'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('build', ['cssmin', 'uglify', 'copy', 'compress']);
};
