sap.ui.define([
	"be/infrabel/psd/controller/BaseController"
], function (BaseController) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.sap.mobile.workmanager.core.ui.BaseMVCController
	 * @name        be.infrabel.psd.controllers.WbsBaseController
	 * @class       be.infrabel.psd.controllers.WbsBaseController
	 * controller 
	 */
	var oWbsBaseController = BaseController.extend("be.infrabel.psd.controller.WbsBaseController" /**@lends be.infrabel.psd.controllers.WbsBaseController.prototype **/ );
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
	 * @author Christophe Taymans
	 **/
	oWbsBaseController.prototype._onObjectMatched = function (oEvent) {
		this.loadTree(oEvent);
		//const oModel = this.getModel("main");
		const sObjectPath = '/' + oEvent.getParameter("arguments").path;
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
	// /**
	//  * on init
	//  * @method onInit
	//  * @public		 
	//  */
	// oWbsBaseController.prototype.onInit = function () {
	// 	BaseController.prototype.onInit.apply(this, arguments);
	// };
	/**
	 * on exit
	 * @method onExit
	 * @public		 
	 */
	oWbsBaseController.prototype.onExit = function () {
		BaseController.prototype.onExit.apply(this, arguments);
	};	
	return oWbsBaseController;
});
