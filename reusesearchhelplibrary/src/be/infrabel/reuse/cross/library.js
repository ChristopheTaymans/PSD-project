sap.ui.define(
	["sap/ui/core/library"],
	function() {
		"use strict";

		/**
		 * Library containing controls/components.
		 *
		 * @namespace
		 * @name    be.infrabel.reuse.cross
		 * @author  Christophe Taymans
		 * @version 0.0.1
		 * @public
		 */

		sap.ui.getCore().initLibrary({
			name: "be.infrabel.reuse.cross",
			version: "0.0.1",
			dependencies: ["sap.ui.core", "sap.m", "sap.f"],
			types: [],
			interfaces: [],
			controls: ["Helper","Input","Select","ComboBox"],
			elements: [],
			noLibraryCSS: false
		});

		return be.infrabel.reuse.cross;
	},
	/** bExport= */ false
);
