sap.ui.define([
	"be/infrabel/psd/controller/BaseController"
], function (BaseController) {
	"use strict";
	/**
	 * @author       Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.BaseController
	 * @name        be.infrabel.psd.controllers.App
	 * @class       be.infrabel.psd.controllers.App
	 * oController 
	 */
	var oController = BaseController.extend("be.infrabel.psd.controller.App"); /**@lends be.infrabel.psd.controllers.App.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.App
	 * @author   Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

		try {
			const backbutton = sap.ui.getCore().byId("backBtn");
			backbutton.attachEventOnce("Press",this, function(oEvent)  {
				oEvent.preventDefault();
		 }.bind(this));
		} catch (err) {
			console.log(err);
		}
	};
	return oController;
});
