sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"./controller/ErrorHandler",
	"be/infrabel/reuse/cross/genericsearch/Helper",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, ErrorHandler, InputHelper, MessageToast, JSON) {
	"use strict";

	return UIComponent.extend("be.infrabel.pcd.Component", {

		metadata: {
			manifest: "json",

		},
		valueHelpComponent: undefined,
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {

			let oGlobalModel;

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");
			// set the message manager model
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

			//initialze the global data
			// Model used to manipulate control states
			const defaultSpan = this.getManifestEntry("sap.ui5").defaultSpan;
			this.setModel(new JSON(defaultSpan), "span");
			oGlobalModel = this.getModel("global");
			oGlobalModel.setData({
				projectId: undefined,
				toSave: false,
				edit: false,
				error: false,
				busy: false,
				add: false,
				delay: 0,
				projectName: "",
				fragment: "",
				inputId: "",
				object: "",
				percentage: 0,
				hasMessages: false,
				isChanged: false
			});

			this._InputHelper = new InputHelper({
					compId: "be.infrabel.pcd",
					appId: "PCD",
					listToLoad: [
						"PositionStakeholder",
						"ImpactStakeholder",
						"TypeRisk",
						"ImpactRisk",
						"ProbabilityRisk",
						"PriorityWork",
						"ManagingService",
						"Completion"
					]
				}).start(this)
				.then(function (oValueHelpComponent) {
					this.valueHelpComponent = oValueHelpComponent;
				}.bind(this))
				.catch(function (oError) {
					MessageToast.show(oError.message);
				}.bind(this));
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			if (this.valueHelpComponent) {
				this.valueHelpComponent.destroy()
			}
			UIComponent.prototype.destroy.apply(this, arguments);

		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				// eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});
