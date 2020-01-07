sap.ui.define([
	"be/infrabel/psd/controller/WbsBaseController"
], function (WbsBaseController) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.Wbs1
	 * @name        be.infrabel.psd.controllers.Wbs1
	 * @class       be.infrabel.psd.controllers.Wbs1
	 * oController 
	 */
	var oController = WbsBaseController.extend("be.infrabel.psd.controller.Wbs1"); /**@lends be.infrabel.psd.controllers.Wbs1.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Wbs1
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		// call the base component's init function
		//WbsBaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("Wbs1Route").attachPatternMatched(this._onObjectMatched, this);
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Wbs1
	 * @author Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function () {
		// call the base component's init function
		WbsBaseController.prototype._onObjectMatched.apply(this, arguments);
		var oInvestmentComponent = this.getSetting("oInvestmentComponent");
		if (oInvestmentComponent) {
			var oData = this.getBindObject();
			oInvestmentComponent.initializeData({
				InvestmentProgram: oData.wbs.InvestmentProgram,
				InvestmentProgramYear: oData.wbs.InvestmentProgramYear,
				PositionID: oData.wbs.PositionID
			});
		}
	};
	/**
	 * called at investment component creation
	 * @method onInvestmentProgramComponentCreated
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent the caller
	 * @memberof  be.infrabel.psd.controller.Wbs1
	 * @author Christophe Taymans
	 **/
	oController.prototype.onInvestmentProgramComponentCreated = function (oEvent) {
		var oInvestmentComponent = oEvent.getParameter("component");
		var oData = this.getBindObject();
		if (oData && oData.wbs) {
			oInvestmentComponent.initializeData({
				InvestmentProgram: oData.wbs.InvestmentProgram,
				InvestmentProgramYear: oData.wbs.InvestmentProgramYear,
				PositionID: oData.wbs.PositionID
			});
		}
		oInvestmentComponent.setEditMode(this.getSetting("edit"));
		this.setSetting("oInvestmentComponent", oInvestmentComponent);
		oInvestmentComponent.attachPositionIdSelected({}, function (oEvent) {
			var oSelected = oEvent.getParameter("selectedItems");
			var oModel = this.getModel("main");
			var oContext = this.getViewBindingContext();
			oModel.setProperty("wbs/InvestmentProgram", oSelected.InvestmentProgram, oContext);
			oModel.setProperty("wbs/InvestmentProgramYear", oSelected.InvestmentProgramYear, oContext);
			oModel.setProperty("wbs/PositionID", oSelected.PositionID, oContext);
			oModel.setProperty("wbs/CentralControllerName", oSelected.CentralControllerName, oContext);
			oModel.setProperty("wbs/ProgramManagerName", oSelected.PersonResponsableName, oContext);
			oModel.setProperty("wbs/FbpDescription", oSelected.FbpDescription, oContext);			
			this._isChangeOccured();
			this.isTreeDataValid();
		}, this);
	};
	return oController;
});
