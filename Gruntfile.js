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
					name: 'main',
					baseUrl: 'src/',
					out: 'dist/d3-schedule.js'
				}
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: {
					'dist/d3-schedule.dev.js': 'src/main.js',
					'dist/d3-schedule.js': 'dist/d3-schedule.js'
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
				'src/main.js',
				'src/booking.json'
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