sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"be/infrabel/reuse/cross/genericsearch/Helper",
	"sap/m/MessageToast",
], function (UIComponent, Device, JSONModel, InputHelper, MessageToast) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     sap/ui/core/UIComponent
	 * @name        be.infrabel.genericshdemo.controllers.Component
	 * @class       be.infrabel.genericshdemo.controllers.Component
	 * component
	 */
	var oComponent = UIComponent.extend("be.infrabel.genericshdemo.Component" /**@lends be.infrabel.genericshdemo.controllers.Component.prototype **/ , {
		metadata: {
			manifest: "json",
			properties: {
				valueHelpComponent: {
					type: "be.infrabel.reuse.cross.genericsearch.Component"
				},
				inputHelper: {
					type: "be.infrabel.reuse.cross.genericsearch.Helper"
				}
			},
			gitUrl : "https://git/EXA326/shdemoapp.git"
		},

	});
	/**
	 * called at component initialisation
	 * @method init
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.genericshdemo.Component
	 * @author Christophe Taymans
	 **/
	oComponent.prototype.init = function () {
		UIComponent.prototype.init.apply(this, arguments);
		// initialize application main parameters
		this.setModel(new JSONModel({
			busy: true,
			delay: 0
		}), "appSetting");
		//**************************************************************************************************************
		// instantiate the input helper
		this.setInputHelper(new InputHelper({
			appId: "PSD",
			compId: "be.infrabel.genericshdemo",
			listToLoad: [
				"GeographicalLocation",
				"LengthUnit",
				"District",
				"Track"
			]
		}));
        //start the input helper service
		this.getInputHelper().start()
			.then(function (oValueHelpComponent) {
				// store the value help component for a later usage
				this.setValueHelpComponent(oValueHelpComponent);
			}.bind(this))
			.catch(function (oError) {
				MessageToast.show(oError.message);
			}.bind(this));
		this.getRouter().initialize();
		//*****************************************************************************************************************
	};
	/**
	 * called at destruction
	 * @method destroy
	 * @private
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.genericshdemo.Component
	 * @author Christophe Taymans
	 **/
	oComponent.prototype.destroy = function () {
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
	 * @memberof be.infrabel.genericshdemo.Component
	 * @author Christophe Taymans     
	 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	oComponent.prototype.getContentDensityClass = function () {
		if (this._sContentDensityClass === undefined) {
			// check whether FLP has already set the content density class; do nothing in this case
			if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
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
	return oComponent;
});
