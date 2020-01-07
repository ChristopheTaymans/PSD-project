sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"be/infrabel/psd/quickscreen01/model/models",
		"sap/ui/model/json/JSONModel",
		"be/infrabel/reuse/cross/genericsearch/Helper",
		"sap/m/MessageToast"
	],
	function (UIComponent, Device, models, JSON, InputHelper, MessageToast) {
		"use strict";
		/**
		 * @name	be.infrabel.psd.quickscreen01.Component
		 * @alias 	be.infrabel.psd.quickscreen01.Component
		 * @license	Infrabel Private
		 * @constructor
		 * @public
		 * @extends sap.ui.core.mvc.Controller
		 * @class
		 * The main component of your app. This also serves as public interface when your component is embedded in another app.<br/>
		 * Be sure to define properties and events that need to be accessible from outside, as well as public methods.<br/>
		 **/
		const Component = UIComponent.extend(
			"be.infrabel.psd.quickscreen01.Component",
			/**@lends be.infrabel.psd.quickscreen01.Component.prototype **/
			{
				metadata: {
					manifest: "json",
					properties: {
						valueHelpComponent: {
							type: "object"
						}
					}
				},
				gitUrl: "https://git/sapfiori/projectsystem/psdquickscreen01"
			}
		);
		/**
		 * @method	init
		 * @license	Infrabel Private
		 * @constructor
		 * @public
		 * @memberof	be.infrabel.psd.quickscreen01.Component
		 * initialization of manifest, device model (if exists) and router (if exists).<br/>
		 **/
		Component.prototype.init = function () {
			UIComponent.prototype.init.apply(this, arguments);
			// Set the device model
			if (models) {
				this.setModel(models.createDeviceModel(), "device");
			}
			const defaultSpan = this.getManifestEntry("sap.ui5").defaultSpan;
			this.setModel(new JSON(defaultSpan), "span");
			this.getModel("global").setData({
				projectId: undefined,
				isValid: false,
				toSave: false,
				error: false,
				busy: false,
				delay: 0,
				oInvestmentComponent: undefined,
				oGeoLocComponent: undefined,
				profileId: "PSD",
				newGeoLoc: [],
				fieldRule: [{
					level: "Quick",
					requiredFields: [{
							key: "PersonResponsableID",
							i18n: "ProjectLeaderLabel"
						},
						{
							key: "ProjectType",
							i18n: "projectprofileLabel"
						},
						{
							key: "FinishDate",
							i18n: "finishdateLabel"
						},
						{
							key: "StartDate",
							i18n: "startdateLabel"
						},
						{
							key: "MainTypeWork",
							i18n: "TypeOfMainWork"
						},
						{
							key: "InvestmentProgram",
							i18n: "investmentprogramLabel"
						},
						{
							key: "InvestmentProgramYear",
							i18n: "investmentprogramLabel"
						},
						{
							key: "PositionID",
							i18n: "investmentprogramLabel"
						}
					],
					requiredGrouped: [
						[{
								key: "Line",
								i18n: "Line"
							},
							{
								key: "Location",
								i18n: "Location"
							},
							{
								key: "District",
								i18n: "District"
							}
						]
					]
				}]
			});
			// initialize the dynamic search help tool
			this.getModel("global").setProperty("/busy", true);
			new InputHelper({
					appId: "PSD",
					compId: "be.infrabel.psd.quickscreen01",
					listToLoad: [
						"ProjectToCreate",
						"Track",
						"District"
					]
				}).start()
				.then(function (oValueHelpComponent) {
					this.setValueHelpComponent(oValueHelpComponent);
					this.getModel("global").setProperty("/busy", false);
				}.bind(this))
				.catch(function (oError) {
					MessageToast.show(oError.message);
				}.bind(this));
			this.getRouter().initialize();
			//register messagemodel:
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message"); //override your default messagemodel
		};
		/**
		 * Called when the component is destroyed
		 *
		 * @method		destroy
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @public
		 * @override
		 */
		Component.prototype.destroy = function () {
			if (this.getValueHelpComponent()) {
				this.getValueHelpComponent().destroy();
			}
			UIComponent.prototype.destroy.apply(this, arguments);
		};
		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @method getContentDensityClass
		 * @public
		 * @instance
		 * @memberof be.infrabel.psd.quickscreen01.Component
		 * @author Christophe Taymans    
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		Component.prototype.getContentDensityClass = function () {
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
		};
		return Component;
	}
);
