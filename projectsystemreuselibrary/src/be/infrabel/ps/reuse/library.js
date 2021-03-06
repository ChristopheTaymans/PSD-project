sap.ui.define(
	["sap/ui/core/library"],
	function() {
		"use strict";

		/**
		 * Library containing controls/components for Infrabel PS Applications.
		 *
		 * @namespace
		 * @name    be.infrabel.ps.reuse
		 * @author  Christophe Taymans
		 * @version 0.0.1
		 * @public
		 */

		sap.ui.getCore().initLibrary({
			name: "be.infrabel.ps.reuse",
			version: "0.0.1",
			dependencies: ["sap.ui.core", "sap.m", "sap.f"],
			types: [],
			interfaces: [],
			controls: [],
			elements: [],
			noLibraryCSS: false
		});

		return be.infrabel.ps.reuse;
	},
	/** bExport= */ false
);
