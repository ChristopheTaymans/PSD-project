/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     sap.ui.core.mvc.Controller
	 * @name        be.infrabel.genericshdemo.controllers.BaseController
	 * @class       be.infrabel.genericshdemo.controllers.BaseController
	 * controller 
	 */
	var oBaseController = Controller.extend("be.infrabel.genericshdemo.controllers.BaseController", {
	
	});
	/**
	 * Convenience method for accessing the router in every controller of the application.
	 * @method getRouter
	 * @public
	 * @returns {sap.ui.core.routing.Router} the router for this component
	 */

	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.onInit = function () {
		this.setModel(new JSONModel(), "Data");
		this.getModel("Data").attachPropertyChange(this.onDataChanged, this);
	};
	/**
	 * Convenience method for getting the router.
	 * @method getRouter
	 * @public 
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	oBaseController.prototype.getRouter = function () {
		return this.getOwnerComponent().getRouter();
	};
	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @method getModel
	 * @public 
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	oBaseController.prototype.getModel = function (sName) {
		return this.getView().getModel(sName);
	};
	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @method setModel
	 * @public
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	oBaseController.prototype.setModel = function (oModel, sName) {
		return this.getView().setModel(oModel, sName);
	};
	/**
	 * Convenience method for getting the resource bundle.
	 * @method getResourceBundle
	 * @public
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	oBaseController.prototype.getResourceBundle = function () {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle();
	};
	/**
	 * Convenience method for getting a text in the resource bundle.
	 * @method getText
	 * @public
	 * @param {string} fTextId the text name in the bundle
	 * @param {string} fArgs arguments for the text
	 * @returns {string} the text
	 */
	oBaseController.prototype.getText = function (fTextId, fArgs) {
		var l_lower = fTextId.toLowerCase();
		return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(l_lower, fArgs);
	};
	/**
	 * Event handler  for navigating back.
	 * It checks if there is a history entry. If yes, history.go(-1) will happen.
	 * If not, it will replace the current entry of the browser history with the master route.
	 * @method onNavBack 
	 * @public
	 */
	oBaseController.prototype.onNavBack = function () {
		var sPreviousHash = History.getInstance().getPreviousHash();
		if (sPreviousHash !== undefined) {
			// The history contains a previous entry
			history.go(-1);
		} else {
			// Otherwise we go backwards with a forward history
			var bReplace = true;
			this.getRouter().navTo("master", {}, bReplace);
		}
	};
	/**
	 * Convenience method to set the busy status
	 * @author Christophe Taymans
	 * @method setBusy
	 * @public
	 * @param {boolean} bState the status	 
	 */
	oBaseController.prototype.setBusy = function (bState) {
		this.getOwnerComponent().getModel("appSetting").setProperty("/busy", bState);
		this.getOwnerComponent().getModel("appSetting").setProperty("/delay", 0);
	};
	/**
	 * Convenience method to set info in info model
	 * @author Christophe Taymans* 
	 * @method setInfo
	 * @public
	 * @param {string} sProperty the property in info structure
	 * @param {string} sValue the value	   
	 */
	oBaseController.prototype.setInfo = function (sProperty, sValue) {
		this.getOwnerComponent().getModel("appSetting").setProperty("/" + sProperty, sValue);
	};
	/**
	 * Convenience method to get info from info model
	 * @author Christophe Taymans
	 * @method getInfo
	 * @public
	 * @param {string} sProperty the property in info structure
	 * @return {string} sValue the value	   
	 */
	oBaseController.prototype.getInfo = function (sProperty) {
		return this.getOwnerComponent().getModel("appSetting").getProperty("/" + sProperty);
	};
	return oBaseController;
});
