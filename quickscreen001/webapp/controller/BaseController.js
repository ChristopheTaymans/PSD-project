sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/message/Message",
	"sap/ui/core/routing/History"
], function (Controller, Fragment, JSON, MessageBox, MessageToast, Message, History) {
	"use strict";
	/**
	 * @name	be.infrabel.psd.quickscreen01.controller.BaseController
	 * @alias 	be.infrabel.psd.quickscreen01.controller.BaseController
	 * @license	Infrabel Private
	 * @constructor
	 * @public
	 * @extends sap.ui.core.mvc.Controller
	 * @class
	 * The basecontroller is inherited by all the controllers of the application. It contains shared functionality that can be triggered
	 * from multiple locations in the app.<br/>
	 **/
	const oBaseController = Controller.extend(
		"be.infrabel.psd.quickscreen01.controller.BaseController",
		/**@lends be.infrabel.psd.quickscreen01.controller.BaseController.prototype */
		{
			navProps: null,
			_oMessagePopover: undefined
		}
	);
	/**
	 * register onRouteMatchedEvent in the basecontroller. You'll need it anyway...
	 * @method onInit
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @public
	 */
	oBaseController.prototype.onInit = function () {
		if (this.getRouter()) {
			this.getRouter().attachEvent("routeMatched", {}, this.onRouteMatched, this)
		}
	};
	/**
	 * on exit
	 * @method onExit
	 * @redefine
	 * @public		 
	 */
	oBaseController.prototype.onExit = function () {
		if (this._oMessagePopover) {
			this._oMessagePopover.destroy();
		}
	};
	/**
	 * the base handler for on route matched. Simply stores the navigation arguments in a variable, so we can reuse it again later.
	 * @todo can, or should we limit ourselves in this method to only store the child* and parent* arguments?
	 * @method onRouteMatched
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @public
	 */
	oBaseController.prototype.onRouteMatched = function (event) {
		this.navProps = event.getParameter("arguments") || {};
	};
	/**
	 * Convenience method for accessing the router in every controller of the application.
	 * @public
	 * @method getRouter
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @returns {sap.f.routing.Router} the router for this component
	 */
	oBaseController.prototype.getRouter = function () {
		return this.getOwnerComponent().getRouter();
	};
	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @public
	 * @method getModel
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	oBaseController.prototype.getModel = function (sName) {
		return this.getView().getModel(sName);
	};
	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @public
	 * @method setModel
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	oBaseController.prototype.setModel = function (oModel, sName) {
		return this.getView().setModel(oModel, sName);
	};
	/**
	 * Convenience method for getting the resource bundle.
	 * @public
	 * @method getResourceBundle
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	oBaseController.prototype.getResourceBundle = function () {
		if (this._bundle) {
			return this._bundle
		}

		this._bundle = this.getOwnerComponent()
			.getModel("i18n")
			.getResourceBundle();

		return this._bundle;
	};
	/**
	 * Event handler  for navigating back.
	 * It checks if there is a history entry. If yes, history.go(-1) will happen.
	 * If not, it will replace the current entry of the browser history with the master route.
	 * @public
	 * @method onNavBack
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 */
	oBaseController.prototype.onNavBack = function () {
		var sPreviousHash = History.getInstance().getPreviousHash();

		if (sPreviousHash !== undefined) {
			// The history contains a previous entry
			history.go(-1);
		} else {
			this.onGoHome();
		}
	};

	/**
	 * Event handler  for navigating toward fiori home
	 * @public
	 * @method onGoHome
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 */
	oBaseController.prototype.onGoHome = function () {
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService &&
			sap.ushell.Container.getService("CrossApplicationNavigation");
		var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: "Shell",
				action: "home"
			}
		})) || "";
		(href && xnavservice && xnavservice.toExternal({
			target: {
				shellHash: href
			}
		}));
	};
	/**
	 * convenience method for routing, that automatically passes parent and child params (nested components).
	 * @method navTo
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 */
	oBaseController.prototype.navTo = function (route, params) {
		let parentChild = this.navProps || {};
		let resultParams = {};
		params = params || {}; //make sure it's an object

		for (let key in parentChild) {
			resultParams[key] = parentChild[key];
		}

		for (let key in params) {
			resultParams[key] = params[key];
		}

		this.getRouter().navTo(route, resultParams);
	};
	/**
	 * convenience method to retrieve the component startup parameters.
	 * @method getStartupParameters
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 */
	oBaseController.prototype.getStartupParameters = function () {
		return (
			this.getOwnerComponent().getComponentData().startupParameters || {}
		);
	};
	/**
	 * Convenience method to add messages in the global messagemanager
	 * @method _addMessage
	 * @private
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @param {map} message - message map
	 * @param {string} message.title
	 * @param {string} message.type
	 * @param {string} message.description
	 * @param {string} message.text
	 * 
	 */
	oBaseController.prototype._addMessage = function (message) {
		sap.ui.getCore().getMessageManager().addMessages(new Message({
			message: message.title,
			description: message.description,
			additionalText: message.text,
			type: message.type || MessageType.Information,
			target: message.target || null,
			processor: message.processor || null
		}));
	};
	/**
	 * Convenience method to remove messages in the global messagemanager
	 * @method _removeMessagesForBinding
	 * @private
	 * @instance
	 * @memberof be.infrabel.psd.quickscreen01.controller.BaseController
	 * @param {map} message - message map
	 * @param {string} message.title
	 * @param {string} message.type
	 * @param {string} message.description
	 * @param {string} message.text
	 * 
	 */
	oBaseController.prototype._removeMessagesForBinding = function (bindingPath) {
		let messages = this.getModel("messages").getData();

		sap.ui.getCore().getMessageManager().removeMessages(
			messages.filter(function (message) {
				return message.target === bindingPath;
			})
		);
	};
	/**
	 * Convenience method to set the busy status
	 * @author Christophe Taymans
	 * @method setBusy
	 * @public
	 * @param {boolean} bState the status	 
	 */
	oBaseController.prototype.setBusy = function (bState) {
		this.setSetting("busy", bState);
		this.setSetting("delay", 0);
	};
	/**
	 * Convenience method for getting a text in the resource bundle.
	 * @method getText
	 * @public
	 * @param {string} fTextId the text name in the bundle
	 * @param {string} fArgs arguments for the text
	 * @returns {string} the text
	 */
	oBaseController.prototype.getText = function (fTextId, fArgs) {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(fTextId, fArgs);
	};
	/**
	 * Convenience method to decode and display error
	 * @method showError 
	 * @public
	 * @param {object} oError the error object
	 * @param {boolean} bToast toast type indicator
	 */
	oBaseController.prototype.showError = function (oError, bToast) {
		var sMessage;
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
	};
	/**
	 * on message popover press
	 * @method onMessagePopoverPress
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent caller
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.onMessagePopoverPress = function (oEvent) {
		const oSource = oEvent.getSource()
		this._getMessagePopover().then(function (oPopover) {
			oPopover.openBy(oSource);
		}.bind(this));
	};
	/**
	 * get message popover 
	 * @method _getMessagePopover
	 * @public
	 * @instance		
	 * @return {promise} a promise
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype._getMessagePopover = function () {
		// create popover lazily
		return new Promise(function (resolve, reject) {
			if (!this._oMessagePopover) {
				Fragment.load({
						name: "be.infrabel.psd.quickscreen01.fragment.MessagePopover",
						controller: this
					}).then(function (oFragment) {
						this._oMessagePopover = oFragment;
						this.getView().addDependent(this._oMessagePopover);
						resolve(this._oMessagePopover);
					}.bind(this))
					.catch(function (oError) {
						reject(oError);
					}.bind(this));

			} else {
				resolve(this._oMessagePopover);
			}
		}.bind(this));
	};
	/**
	 * Convenience method for getting the global model data.
	 * @method getSetting
	 * @public
	 * @param {string} sProperty the property name
	 * @returns {object} the property value
	 */
	oBaseController.prototype.getSetting = function (sProperty) {
		if (this.getModel("global")) {
			if (sProperty) {
				return this.getModel("global").getProperty("/" + sProperty);
			} else {
				return this.getModel("global").getData();
			}
		} else {
			return undefined;
		}
	};
	/**
	 * Convenience method for setting the global model data.
	 * @method setSetting
	 * @public
	 * @param {string} sProperty the the property name
	 * @param {object} oValue the property value
	 */
	oBaseController.prototype.setSetting = function (sProperty, oValue) {
		this.getModel("global").setProperty("/" + sProperty, oValue);
	};
	/**
	 * Convenience method for getting the current view binding context
	 * @method getViewBindingContext 
	 * @public
	 * @returns {object} the current binded object data
	 */
	oBaseController.prototype.getViewBindingContext = function () {
		return this.getView().getBindingContext("main");
	};
	/**
	 * Convenience method for getting the current object bind to the view
	 * @method getBindObject 
	 * @public
	 * @returns {object} the current binded object data
	 */
	oBaseController.prototype.getBindObject = function () {
		return this.getViewBindingContext() ? this.getViewBindingContext().getObject() : undefined;
	};
	/**
	 * check before exit
	 * @method checkBeforeExit
	 * @public
	 * @instance		
	 * @returns {promise} - the promise
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.checkBeforeExit = function () {
		return new Promise(function (resolve, reject) {
			var oModel = this.getModel("main");
			if (oModel.hasPendingChanges()) {
				MessageBox.show(this.getText("ConfirmToExit"), {
					icon: sap.m.MessageBox.Icon.QUESTION,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (sReply) {
						if (sReply === MessageBox.Action.YES) {
							resolve();
						} else {
							reject();
						}
					}
				})
			} else {
				resolve()
			};
		}.bind(this));
	};
	/**
	 * is Required Field Empty
	 * @method _isRequiredFieldEmpty
	 * @private
	 * @instance	
	 * @param {object} oMainData the data to check
	 * @returns {boolean} state
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype._isRequiredFieldEmpty = function (oMainData, level) {
		var bIsEmpty = false;
		if (!level) {
			level = oMainData.HierarchyLevel
		};
		var afieldRule = this.getSetting("fieldRule").filter(function (oRule) {
			return level === oRule.level
		});
		if (afieldRule.length) {
			if (afieldRule[0].requiredFields && afieldRule[0].requiredFields.length) {
				afieldRule[0].requiredFields.forEach(function (sFieldpath) {
					var oData = oMainData;
					var aParts = sFieldpath.key.split("/"),
						iIndex = 0;
					if (!aParts[0]) {
						// absolute path starting with slash			
						iIndex++;
					}
					while (oData && aParts[iIndex]) {
						oData = oData[aParts[iIndex]];
						iIndex++;
					}
					if (typeof oData === "string") {
						oData = oData.trim();
					}
					if (!oData) {
						oMainData.Error = true;
						bIsEmpty = true;
						this.addMessage(oMainData.Node, this.getText("RequiredFieldMissing", [this.getText(sFieldpath.i18n)]), sap.ui.core.MessageType.Warning)
					}
				}.bind(this));
			}
			// check group of required : it means taht if at least one filed of the gorup is fullfiulled the check is succesfull
			if (afieldRule[0].requiredGrouped && afieldRule[0].requiredGrouped.length) {
				afieldRule[0].requiredGrouped.forEach(function (oGroup) {
					let bIsFullfilled = false;
					oGroup.forEach(function (sFieldpath) {
						let oData = oMainData;
						let aParts = sFieldpath.key.split("/"),
							iIndex = 0;
						if (!aParts[0]) {
							// absolute path starting with slash			
							iIndex++;
						}
						while (oData && aParts[iIndex]) {
							oData = oData[aParts[iIndex]];
							iIndex++;
						}
						if (typeof oData === "string") {
							oData = oData.trim();
						}
						if (oData) {
							bIsFullfilled = true
						}
					}.bind(this));
					if (!bIsFullfilled) {
						oMainData.Error = true;
						bIsEmpty = true;
						this.addMessage(oMainData.Node, this.getText("RequiredFieldGroupMissing", oGroup.map(function (row) {
							return this.getText(row.i18n);
						}.bind(this)).toString()), sap.ui.core.MessageType.Warning)
					}
				}.bind(this));
			}
		}
		return bIsEmpty;
	};
	/**
	 * add a message to mesage manager
	 * @method addMessage
	 * @public
	 * @param {string} sMessage message text
	 * @param {sap.ui.core.MessageType} sType message type
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.addMessage = function (sTarget, sMessage, sType) {
		sap.ui.getCore().getMessageManager().addMessages(new Message({
			description: sTarget ? sTarget + " : " : undefined,
			message: sMessage,
			type: sType
		}));
	};
	/**
	 * aggregate Message from message handler
	 * @method _aggregateMessage
	 * @private	  
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype._aggregateMessage = function () {
		const aMessages = this.getModel("message").getData().reduce(function (newArray, oMessage) {
			if (!newArray.some(function (row) {
					return oMessage.message === row.message && oMessage.description === row.description;
				})) {
				newArray.push(oMessage)
			}
			return newArray;
		}.bind(this), [])
		this.getModel("message").setData(aMessages);
	};
	/**
	 * translate Message target 
	 * @method translateMessageTarget
	 * @public	  
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.translateMessageTarget = function () {
		const aMessages = this.getModel("message").getData().map(function (oMessage) {
			if (oMessage.target) {
				const sTarget = this.getModel("main").getProperty(oMessage.target);
				if (typeof sTarget != 'object' && sTarget) {
					oMessage.description = sTarget + " : ";
				} else if (typeof sTarget === 'object') {
					oMessage.description = sTarget.Node ? sTarget.Node + " : " : "";
				} else {
					oMessage.description = oMessage.target.slice(1) + " : ";
				}
			}
			return oMessage;
		}.bind(this), [])
		this.getModel("message").setData(aMessages);
		this._aggregateMessage();
	};
	/**
	 * is Change Occured
	 * @method _isChangeOccured
	 * @private
	 * @instance	
	 * @returns {boolean} state
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype._isChangeOccured = function () {
		this.setSetting("toSave", this.getModel("main").hasPendingChanges());
		return this.getSetting("toSave");
	};

	return oBaseController;
});
