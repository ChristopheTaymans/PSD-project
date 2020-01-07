sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/message/Message",
	"sap/ui/core/Fragment"
], function (Controller, UIComponent, mobileLibrary, MessageBox, MessageToast, Message, Fragment) {
	"use strict";

	return Controller.extend("be.infrabel.pcd.controller.BaseController", {

		/**
		 * on message popover press
		 * @method onMessagePopoverPress
		 * @public
		 * @instance	
		 * @param {sap.ui.base.Event} oEvent caller
		 * @author Pepijn Vanderlinden
		 **/
		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		/**
		 * on Info press
		 * @method onInfoPress
		 * @public
		 * @instance	
		 * @param {sap.ui.base.Event} oEvent caller
		 * @author Pepijn Vanderlinden
		 **/
		onInfoPress: function (oEvent) {
			let oControl = oEvent.getSource();
			let oCtx = this.getViewBindingContext();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "be.infrabel.pcd.view.fragment.AdministrativeData",
					controller: this
				}).then(function (oFragment) {
					this._oPopover = oFragment;
					this.getView().addDependent(this._oPopover);
					this._oPopover.setBindingContext(oCtx, "main");
					this._oPopover.openBy(oControl);
				}.bind(this));
			} else {
				this._oPopover.openBy(oControl);
			}

		},

		/**
		 * close administrative data popover
		 * @method onInfoPress 
		 * @public
		 * @instance
		 * @author Pepijn Vanderlinden
		 **/
		onExitAdministrativeData: function () {
			this._oPopover.close();
		},

		/**
		 * get message popover 
		 * @method _getMessagePopover
		 * @public
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_getMessagePopover: function () {
			// create popover lazily
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "be.infrabel.pcd.view.fragment.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
				// Fragment.load({
				// 	name: "be.infrabel.pcd.view.fragment.MessagePopover",
				// 	type: "XML",
				// 	controller: this
				// }).then(function (MessagePopover) {
				// 	this.getView().addDependent(MessagePopover);
				// 	this._oMessagePopover = MessagePopover;
				// }.bind(this));
			}
			return this._oMessagePopover;
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setSetting: function (sProperty, oValue) {
			this.getModel("global").setProperty("/" + sProperty, oValue);
		},

		getSetting: function (sProperty) {
			return this.getModel("global").getProperty("/" + sProperty);
		},
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method for getting the current view binding context
		 * @method getViewBindingContext 
		 * @public
		 * @returns {object} the current binded object data
		 */
		getViewBindingContext: function () {
			return this.getView().getBindingContext("main");
		},

		/**
		 * Convenience method to set the busy status
		 * @author Christophe Taymans
		 * @method setBusy
		 * @public
		 * @param {boolean} bState the status	 
		 */
		setBusy: function (bState) {
			this.setSetting("busy", bState);
			this.setSetting("delay", 0);

		},

		/**
		 * Convenience method for getting a text in the resource bundle.
		 * @method getText
		 * @public
		 * @param {string} fTextId the text name in the bundle
		 * @param {string} fArgs arguments for the text
		 * @returns {string} the text
		 */
		getText: function (fTextId, fArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(fTextId, fArgs);
		},

		/**
		 * Convenience method to decode and display error
		 * @method showError 
		 * @public
		 * @param {object} oError the error object
		 * @param {boolean} bToast toast type indicator
		 */
		showError: function (oError, bToast) {
			let sMessage;
			try {
				sMessage = JSON.parse(oError.responseText).error.message.value;
			} catch (error) {
				sMessage = this.getText("UNDEFINEDERROR");
			}
			if (bToast) {
				MessageToast.show(sMessage, {
					closeOnBrowserNavigation: false
				});
			} else {
				MessageBox.error(sMessage);
			}

		},

		/**
		 * initialize
		 * @method initialize
		 * @public
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		initialize: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
			let oModel = this.getModel("main");
			if (oModel.hasPendingChanges()) {
				oModel.resetChanges()
			};
			let oSettings = this.getModel("global").getData();
			oSettings.busy = false;
			oSettings.edit = true;
		},
		
		setChanged: function(isChanged){
			this.setSetting("isChanged", isChanged);
		},
		
		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			let aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				let bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()

	});

});