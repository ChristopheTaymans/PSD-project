/* eslint-env es6 */
module.exports = function(grunt) {
	"use strict";
	grunt.initConfig({
		dir: {
			src: ".", // The source folder (in which you develop)	
			dest : "C:/Users/exa326/Google Drive/Git/PSD project"
		},

		clean: {
			options: {
				'force': true
			  },
			dist: "<%= dir.dest %>/"
		},
		copy: {
			myarchive: {
				files: [
					{
						expand: true,
						src: ["**", 
						"!**/node_modules/**",
						"!**/dist/**",
						"!**/project/**"
					    ],
						cwd: "<%= dir.src %>",
						dest: "<%= dir.dest %>/" //trailing slash is important
					}
				]
			}
		},

		
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	// Default task
	grunt.registerTask("default", ["clean","copy"]);
};
