module.exports = function( grunt ) {
	'use strict';
	
	// Require all Grunt tasks.
	require( 'load-grunt-tasks' )( grunt );
	
	// Configure each task.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.title %> <%= pkg.version %>\n' +
				' * \n' +
				' * @author <%= pkg.author.name %> \n' +
				' * @license <%= pkg.repository.url %> <%= pkg.license.type %>\n' +
				'*/\n'
		},
		requirejs: {
			compile: {
				options: {
					name: 'd3-schedule',
					baseUrl: 'src/',
					paths: {
						d3: 'empty:'
					},
					out: 'dist/d3-schedule.min.js'
				}
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: {
					'dist/d3-schedule.js': 'src/d3-schedule.js',
					'dist/d3-schedule.min.js': 'dist/d3-schedule.min.js'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'package.json',
				'src/d3-schedule.js'
			]
		}
	} );
	
	// Register tasks.
	grunt.registerTask( 'default', [ 'jshint' ]);
	grunt.registerTask( 'release', [
		'jshint',
		'requirejs',
		'concat'
	] );
};