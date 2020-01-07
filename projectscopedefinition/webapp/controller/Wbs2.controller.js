sap.ui.define([
	"be/infrabel/psd/controller/WbsBaseController"
], function (WbsBaseController) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.Wbs2
	 * @name        be.infrabel.psd.controllers.Wbs2
	 * @class       be.infrabel.psd.controllers.Wbs2
	 * oController 
	 */
	var oController = WbsBaseController.extend("be.infrabel.psd.controller.Wbs2"); /**@lends be.infrabel.psd.controllers.Wbs2.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Wbs2
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		// call the base component's init function
		//WbsBaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("Wbs2Route").attachPatternMatched(this._onObjectMatched, this);
	};
	return oController;
});
