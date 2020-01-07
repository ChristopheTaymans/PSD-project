sap.ui.define([
	"be/infrabel/genericshdemo/controller/baseController",
	"sap/ui/model/json/JSONModel"
], function (baseController, JSON) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.genericshdemo.controllers.BaseController
	 * @name        be.infrabel.genericshdemo.controllers.Master
	 * @class       be.infrabel.genericshdemo.controllers.Master
	 * oController 
	 */
	var oController = baseController.extend("be.infrabel.genericshdemo.controller.main"); /**@lends be.infrabel.genericshdemo.controllers.main.prototype **/

	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.genericshdemo.controllers.Master
	 * @author Christophe Taymans
	 **/
	oController.prototype.onInit = function () {	
		this.getRouter().getRoute("main").attachMatched(this._onRouteMatched, this);
		this.setModel(new JSON({
			LineDescription: "",
			ControllingArea:undefined,
            CostCenter : undefined
		}), "viewModel");
		this.getOwnerComponent().getInputHelper().isLoaded("be.infrabel.genericshdemo")
		.then(function(oComponent){
			oComponent.attachItemSelected(function (oEvent) {
				const oParameters = oEvent.getParameters();
				if (oParameters.control.getSearchHelpId() === "Line") {
					this.getModel("viewModel").setProperty("/LineDescription", oParameters.selectedItem.value);
				}
			}.bind(this))
		}.bind(this));
	};
	/**
	 * called when Master route matched
	 * @method onInitialRouteMatched
	 * @private
	 * @instance
	 * @param {event} oEvent
	 * @memberof be.infrabel.genericshdemo.controllers.Master
	 * @author Christophe Taymans
	 **/
	oController.prototype._onRouteMatched = function (oEvent) {
		this.getOwnerComponent().getModel("main").metadataLoaded().then(function () {
			var sPath = this.getModel("main").createKey("/QuickScreenSet", {
				ProfileId: 'PSD',
				ActionId: 'Q0001'
			});
			this.getModel("main").invalidateEntry(sPath);
			this.getView().bindElement({
				path: sPath,
				model: "main",
				events: {
					dataRequested: function () {
						this.setBusy(true);
					}.bind(this),
					dataReceived: function () {		
						this.setBusy(false);
					}.bind(this)
				}
			});
		}.bind(this))
	}

	return oController;
});
