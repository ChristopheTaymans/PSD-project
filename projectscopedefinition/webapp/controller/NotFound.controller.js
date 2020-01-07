sap.ui.define([
	"be/infrabel/psd/controller/BaseController"
], function (BaseController) {
	"use strict";
		/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.NotFound
	 * @name        be.infrabel.psd.controllers.NotFound
	 * @class       be.infrabel.psd.controllers.NotFound
	 * oController 
	 */
	var oController = BaseController.extend("be.infrabel.psd.controller.NotFound"); /**@lends be.infrabel.psd.controllers.ProjectDefinition.prototype **/
	/**
	 * called at controler initialisation
	 * @method onLinkPressed 
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.NotFound
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onLinkPressed = function () {
		this.navTo("worklist");
	};
	return oController;
});
