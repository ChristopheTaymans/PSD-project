/* eslint-env es6 */
module.exports = function(grunt) {
	"use strict";

	// Log time how long tasks take
	require("grunt-timer").init(grunt, {
		deferLogs: true,
		friendlyTime: true,
		color: "cyan"
	});

	const objectMerge = require("object-merge");

	const oProjectConfig = grunt.file.exists(".project.json")
		? grunt.file.readJSON(".project.json")
		: {};
	const oUserConfig = grunt.file.exists(".user.project.json")
		? grunt.file.readJSON(".user.project.json")
		: {};
	const oFinalCfg = objectMerge(oProjectConfig, oUserConfig);

	// read sap deployment config file (only needed for sap nw abap deployment)
	const SAPDEPLOY_FILE_PATH = oFinalCfg.sapdeploy.configFile;
	let sapDeployConfig = grunt.file.exists(SAPDEPLOY_FILE_PATH)
		? grunt.file.readJSON(SAPDEPLOY_FILE_PATH)
		: {};

	// read + merge credentials file for sap nw abap deployment
	const SAPDEPLOYUSER_FILE_PATH = oFinalCfg.sapdeploy.credentialsFile;
	const oCredentials = grunt.file.exists(SAPDEPLOYUSER_FILE_PATH)
		? grunt.file.readJSON(SAPDEPLOYUSER_FILE_PATH)
		: {};
	sapDeployConfig = objectMerge(sapDeployConfig, oCredentials);

	//https://www.npmjs.com/package/multiparty
	let multiparty = require("multiparty");

	// Only Used for the connect grunt task
	let fnHandleFileUpload = function(bSave, req, res, next) {
		let bError, count, aFiles, form;

		bError = false;
		count = 0;
		aFiles = [];

		// see https://github.com/pillarjs/multiparty for API
		form = new multiparty.Form({
			//uploadDir : TMP_UPLOAD_PATH,
			maxFilesSize: 1024 * 1024 * 15 // 15 MB
		});

		if (bSave) {
			// make sure to manually delete the files afterwards from!!!
			// suggestion: DO NOT USE THIS ON PROD because it exposes internal folder structures
			form.parse(req, function(err, fields, files) {
				if (err) {
					res.writeHead(err.status, {
						"Content-Type": "application/json;charset=utf-8"
					});
					res.end(JSON.stringify({ errorCode: err.code }));
				} else {
					res.writeHead(200, {
						"Content-Type": "application/json;charset=utf-8"
					});
					res.end(JSON.stringify({ fields: fields, files: files }));
				}
			});
		} else {
			//files are not saved to local disk :-)
			form.on("error", function(err) {
				console.log("Error parsing form: " + err.stack);
				bError = true;
			});

			form.on("part", function(part) {
				if (!part.filename) {
					// filename is not defined when this is a field and not a file
					//console.log('got field named ' + part.name);
					part.resume();
				} else if (part.filename) {
					// filename is defined when this is a file
					count++;
					aFiles.push({
						headers: part.headers,
						fieldName: part.name,
						filename: part.filename,
						//byteOffset: part.byteOffset,
						byteCount: part.byteCount
					});
					// ignore file's content here
					part.resume();
				}

				part.on("error", function(err) {
					console.log("Error parsing part: " + err.stack);
					bError = true;
				});
			});

			form.on("close", function() {
				console.log("Upload completed!");
				res.writeHead(200, {
					"Content-Type": "application/json;charset=utf-8"
				});
				res.end(
					JSON.stringify({
						success: bError === false,
						uploadedFiles: count,
						files: aFiles
					})
				);
			});
			// finally do the job for us
			form.parse(req);
		}
	};

	/**
	 * Rename JavaScript files, all others stay as they are. Examples:
	 * App.controller.js ==> App-dbg.controller.js
	 * Component.js ==> Component-dbg.js
	 *
	 * @param   {string}    dest    the destination folder
	 * @param   {string}    src     the filename
	 *
	 * @returns {string}    the new file name for js files
	 */
	const fnFileRename = function(dest, src) {
		let destFilename = "";
		if (src.endsWith(".controller.js")) {
			destFilename =
				dest + src.replace(/\.controller\.js$/, "-dbg.controller.js");
		} else if (src.endsWith(".js")) {
			destFilename = dest + src.replace(/\.js$/, "-dbg.js");
		} else {
			destFilename = dest + src;
		}
		grunt.log.writeln(
			src + " ==>" + destFilename + "(dest = " + dest + ", src = " + src + ")"
		);
		return destFilename;
	};

	grunt.initConfig({
		libraryName: "be.infrabel.reuse.cross",

		dir: {
			src: "src",
			test: "test",
			dist: "dist",
			sapui5: "../sapui5_sources" // Point to the sapui5_sources project on your local drive
		},

		watch: {
			options: {
				livereload: true
			},
			css: {
				files: ["src/**/*.less", "src/**/*.css"],
				tasks: ["build"]
			},
			js: {
				files: [
					"src/**/*.js",
					"src/**/*.xml",
					"src/**/*.json",
					"src/**/*.html",
					"src/**/*.properties"
				],
				tasks: ["build"]
			}
		},

		// Only used for local testing!
		connect: {
			options: {
				port: 8080,
				hostname: "*",
				middleware: function(connect, options, middlewares) {
					// inject a custom middleware into the array of default middlewares
					middlewares.unshift(
						connect().use("/upload", function(req, res, next) {
							fnHandleFileUpload(true, req, res, next); //ONLY FOR LOCAL DEV!!!
							return undefined;
						})
					);
					return middlewares;
				},
				livereload: true
			},
			src: {},
			dist: {}
		},

		// Only used for local testing!
		openui5_connect: {
			src: {
				options: {
					resources: ["<%= dir.sapui5 %>/resources", "<%= dir.src %>"],
					testresources: ["<%= dir.sapui5 %>/test-resources", "<%= dir.test %>"]
				}
			},
			dist: {
				options: {
					resources: [
						"<%= dir.sapui5 %>/resources",
						"<%= dir.dist %>/resources"
					],
					testresources: [
						"<%= dir.sapui5 %>/test-resources",
						"<%= dir.dist %>/test-resources"
					]
				}
			}
		},

		openui5_theme: {
			theme: {
				files: [
					{
						expand: true,
						cwd: "<%= dir.src %>",
						src: "**/themes/*/library.source.less",
						dest: "<%= dir.dist %>/resources"
					}
				],
				options: {
					rootPaths: ["<%= dir.sapui5 %>/resources", "<%= dir.src %>"],
					library: {
						name: "<%= libraryName %>"
					}
				}
			}
		},

		// Making the component preload files
		openui5_preload: {
			component: {
				options: {
					compatVersion: "1.54",
					resources: "<%= dir.src %>",
					dest: "<%= dir.dist %>/resources"
				},
				components: true
			},
			library: {
				options: {
					resources: "<%= dir.src %>",
					dest: "<%= dir.dist %>/resources",
					compatVersion: "1.54"
				},
				libraries: {
					"be/infrabel/reuse/cross": {
						src: [
							"be/infrabel/reuse/cross/**",
							"!be/infrabel/reuse/cross/thirdparty/**"
						]
					},
					dest: "<%= dir.dist %>/resources",
					compress: true
				},
				components: true
			}
		},

		clean: {
			dist: "<%= dir.dist %>/"
		},

		copy: {
			distDeploy: {
				files: [
					{
						//first all resources relevant for *-dbg.js
						expand: true,
						src: [
							"**",
							"!be/infrabel/reuse/cross/themes/**",
							"!be/infrabel/reuse/cross/thirdparty/**"
						],
						cwd: "<%= dir.src %>",
						dest: "<%= dir.dist %>/resources/", //trailing slash is important
						rename: fnFileRename
					},
					{
						//first all resources relevant for *.js
						expand: true,
						src: [
							"**",
							"!be/infrabel/reuse/cross/themes/**",
							"!be/infrabel/reuse/cross/thirdparty/**"
						],
						cwd: "<%= dir.src %>",
						dest: "<%= dir.dist %>/resources/", //trailing slash is important					
					},
					{
						//then everything else "be/infrabel/reuse/cross/themes/**",
						expand: true,
						cwd: "<%= dir.src %>",
						src: [
							"be/infrabel/reuse/cross/thirdparty/**",
							"be/infrabel/reuse/cross/.library",
							"be/infrabel/reuse/cross/library.js"
						],
						dest: "<%= dir.dist %>/resources"
					},
					{
						//finally the test resources
						expand: true,
						cwd: "<%= dir.test %>",
						src: ["**"],
						dest: "<%= dir.dist %>/test-resources"
					}
				]
			}
		},

		// Coding style!
		eslint: {
			src: ["<%= dir.src %>"],
			test: ["<%= dir.test %>"],
			gruntfile: ["Gruntfile.js"]
		},

		// Generate zip-file of the resources
		compress: {
			dist: {
				options: {
					archive: "<%= dir.dist %>/infrabel-ui5-project.zip"
				},
				expand: true,
				cwd: "<%= dir.dist %>/resources",
				src: ["**/*"],
				dot: true,
				dest: "/"
			}
		},

		// Deploy to SAP
		nwabap_ui5uploader: sapDeployConfig
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-openui5");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-nwabap-ui5uploader");
	grunt.loadNpmTasks("grunt-contrib-watch");

	//JSDoco parsing
	grunt.registerTask('jsdoc', 'parsing all jsdoco into one big json file', function(){
		grunt.log.writeln('Generating JSDoc file');
		var done = this.async();

		var jsdocx = require('jsdoc-x');

		jsdocx.parse({
			files:[
				'./webapp/**/*.js',
				"!webapp/test/**",
				"!webapp/localService/**"
			],
			excludePattern:'(test|localService)',
			recurse:true,
			private:true,
			output:'./dist/resources/documentation.json',
			encoding:'utf-8'
		}, function (err, docs) {
			if(err){
				grunt.log.writeln('JSDoc file generation failed with error:');
				grunt.log.writeln(err);
				done(false);
			}else{
				grunt.log.writeln('JSDoc file generated');
				done(true);
			}			
		});
	});

	// Server task
	grunt.registerTask("serve", function(target) {
		grunt.task.run("openui5_connect:" + (target || "src")); //+ ":keepalive"
		grunt.task.run("watch");
	});

	// Linting task
	grunt.registerTask("lint", ["eslint"]);

	// Build task
	grunt.registerTask("build", [
		"clean",
		"openui5_preload",
		"copy",
		"compress:dist"
	]);

	// SAP deployment
	grunt.registerTask("sapdeploy", ["lint", "build", "nwabap_ui5uploader"]);

	// Default task
	grunt.registerTask("default", ["lint", "build", "serve:dist"]);
};
