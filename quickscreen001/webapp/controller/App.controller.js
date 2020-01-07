sap.ui.define(
	[
		"be/infrabel/psd/quickscreen01/controller/BaseController"
	],
	function(BaseController) {
		"use strict";

		/**
		 * @name	be.infrabel.psd.quickscreen01.controller.App
		 * @alias 	be.infrabel.psd.quickscreen01.controller.App
		 * @constructor
		 * @public
		 * @extends sap.ui.core.mvc.Controller
		 * @class
		 * The basecontroller is inherited by all the controllers of the application. It contains shared functionality that can be triggered
		 * from multiple locations in the app.<br/>
		 **/
		const AppController = BaseController.extend(
			"be.infrabel.psd.quickscreen01.controller.App",
			/** @lends be.infrabel.psd.quickscreen01.controller.App.prototype */
			{
				constructor: function() {}
			}
		);

		/**
		 * initializing event handler
		 * @method onInit
		 * @public
		 * @instance
		 * @memberof be.infrabel.psd.quickscreen01.controller.App
		 * @public
		 */
		AppController.prototype.onInit = function() {
				// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		};

		return AppController;
	}
);
