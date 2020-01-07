sap.ui.define([
	"be/infrabel/genericshdemo/controller/baseController"
], function (BaseController) {
	"use strict";
	var oController = BaseController.extend("be.infrabel.genericshdemo.controller.app"); /**@lends be.infrabel.genericshdemo.controllers.app.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.genericshdemo.controllers.app
	 * @author Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
	};

	return oController;
});
