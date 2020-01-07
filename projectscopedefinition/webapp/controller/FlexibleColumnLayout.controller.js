sap.ui.define([
	"be/infrabel/psd/controller/BaseController"
], function (BaseController) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.FlexibleColumnLayout
	 * @name        be.infrabel.psd.controllers.FlexibleColumnLayout
	 * @class       be.infrabel.psd.controllers.FlexibleColumnLayout
	 * oController 
	 */
	var oController = BaseController.extend("be.infrabel.psd.controller.FlexibleColumnLayout"); /**@lends be.infrabel.psd.controllers.FlexibleColumnLayout.prototype **/
	/**
	 * called at State Change
	 * @method onStateChange
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.controllers.FlexibleColumnLayout
	 * @param {event} oEvent - the calling event
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onStateChange = function (oEvent) {
		if (oEvent.getParameter("layout") === sap.f.LayoutType.TwoColumnsBeginExpanded) {
			this.setSetting("treeColumnExpanded", true)
		} else {
			this.setSetting("treeColumnExpanded", false)
		}
	};
	return oController;
});
