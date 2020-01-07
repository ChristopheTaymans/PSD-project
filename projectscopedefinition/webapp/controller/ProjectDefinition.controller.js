sap.ui.define([
	"be/infrabel/psd/controller/BaseController"
], function (BaseController) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.ProjectDefinition
	 * @name        be.infrabel.psd.controllers.ProjectDefinition
	 * @class       be.infrabel.psd.controllers.ProjectDefinition
	 * oController 
	 */
	var oController = BaseController.extend("be.infrabel.psd.controller.ProjectDefinition"); /**@lends be.infrabel.psd.controllers.ProjectDefinition.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.ProjectDefinition
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		//BaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("ProjectDefinitionRoute").attachPatternMatched(this._onObjectMatched, this);
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
	 * @memberof  be.infrabel.psd.controller.ProjectDefinition
	 * @author Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function (oEvent) {
		this.loadTree(oEvent);
		var sObjectPath = '/' + oEvent.getParameter("arguments").path;
		if (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath,
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
		}
	};
	return oController;
});
