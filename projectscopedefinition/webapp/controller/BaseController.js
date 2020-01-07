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
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.sap.mobile.workmanager.core.ui.BaseMVCController
	 * @name        be.infrabel.psd.controllers.BaseController
	 * @class       be.infrabel.psd.controllers.BaseController
	 * controller 
	 */
	var oBaseController = Controller.extend("be.infrabel.psd.controller.BaseController", /**@lends be.infrabel.psd.controllers.BaseController.prototype **/ {
		navProps: null,
		_oMessagePopover: undefined
	});
	// /**
	//  * on init
	//  * @method onInit
	//  * @public		 
	//  */
	oBaseController.prototype.onInit = function () {
		if (this.getRouter()) {
			this.getRouter().attachEvent("routeMatched", {}, this.onRouteMatched, this)
		}
	};
	/**
	 * on route matched
	 * @method onRouteMatched 
	 * @public		 
	 */
	oBaseController.prototype.onRouteMatched = function (event) {
		this.navProps = event.getParameter("arguments") || {};
	};
	/**
	 * convenience method for routing, that automatically passes parent and child params (nested components).
	 * @method navTo
	 * @public
	 * @instance
	 */
	oBaseController.prototype.navTo = function (route, params, bReplace) {
		let parentChild = this.navProps || {};
		let resultParams = {};
		params = params || {}; //make sure it's an object

		for (let key in parentChild) {
			resultParams[key] = parentChild[key];
		}

		for (let key in params) {
			resultParams[key] = params[key];
		}

		this.getRouter().navTo(route, resultParams, bReplace);
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
	 * Convenience method for getting the router.
	 * @method getRouter
	 * @public 
	 * @returns {sap.ui.model.Router} the router instance
	 */
	oBaseController.prototype.getRouter = function () {
		return this.getOwnerComponent().getRouter();
	};
	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @method getModel
	 * @public 
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	oBaseController.prototype.getModel = function (sName) {
		return this.getView().getModel(sName);
	};
	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @method setModel
	 * @public
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	oBaseController.prototype.setModel = function (oModel, sName) {
		return this.getView().setModel(oModel, sName);
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
	 * Convenience method for getting the tree model.
	 * @method getTreeModel
	 * @public
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	oBaseController.prototype.getTreeModel = function () {
		return this.getModel("tree");
	};
	/**
	 * Convenience method for getting the resource bundle.
	 * @method getResourceBundle
	 * @public
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	oBaseController.prototype.getResourceBundle = function () {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle();
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
	 * Adds a history entry in the FLP page history
	 * @method addHistoryEntry
	 * @public	
	 * @param {Object} oEntry	 the current history entry
	 * @param {boolean} bReset	 the reste indicator
	 * @return {function} - the function to add history entry
	 */
	oBaseController.prototype.addHistoryEntry = function (oEntry, bReset) {
		var aHistoryEntries = [];
		if (bReset) {
			aHistoryEntries = [];
		}
		var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
			return oHistoryEntry.intent === oEntry.intent;
		});
		if (!bInHistory) {
			aHistoryEntries.push(oEntry);
			this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
				oService.setHierarchy(aHistoryEntries);
			});
		}
	};
	/**
	 * Event handler  for navigating back.
	 * It checks if there is a history entry. If yes, history.go(-1) will happen.
	 * If not, it will replace the current entry of the browser history with the master route.
	 * @public
	 * @method onNavBack
	 * @public
	 * @instance
	 */
	oBaseController.prototype.onNavBack = function () {
		var sPreviousHash = History.getInstance().getPreviousHash();

		if (sPreviousHash !== undefined) {
			// The history contains a previous entry
			history.go(-1);
		} else {
			// Otherwise we go backwards with a forward history
			var bReplace = true;
			this.navTo("worklistRoute", {}, bReplace);
		}
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
	 * convenience method to validate tree Data
	 * @method isTreeDataValid 
	 * @public
	 * @instance
	 * @returns {boolean} is valid
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.isTreeDataValid = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		var oTreeData = this.getTreeModel().getData();
		var bError = oTreeData.project.levels.reduce(function (bError, oData) {
			if (this.validateNodeData(oData, true)) {
				bError = true;
			}
			return bError;
		}.bind(this), false);
		this.setSetting("isValid", !bError);
		this.getOwnerComponent().getEventBus().publish("treeRefresh");
		return !bError;
	};
	/**
	 * convenience method to validate node Data
	 * @method validateData
	 * @public
	 * @instance
	 * @param {object} oNode the node to check
	 * @param {boolean} dDeep indicatror of deep checking
	 * @returns {boolean} is valid
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.validateNodeData = function (oNode, bDeep) {
		var bError;
		var oMainData = this.getModel("main").getObject(oNode.Path);
		bError = this._isRequiredFieldEmpty(oMainData);
		// if (bError) {
		// 	this.addMessage(oNode.Node, this.getText("RequiredFieldMissing"), sap.ui.core.MessageType.Warning)
		// }
		oNode.Error = bError;
		if (bDeep) {
			if (oNode.HierarchyLevel < 3 && !oNode.levels.length) {
				//the Branch hasn't 3 levels
				bError = true;
				if (bError) {
					this.addMessage(oNode.Node, this.getText("MissingSubLevel"), sap.ui.core.MessageType.Warning)
				}
			}
			oNode.levels.forEach(function (oData) {
				if (this.validateNodeData(oData, true)) {
					bError = true
				};
			}.bind(this));
		}
		return bError;
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
	/**
	 * open administrative data popover
	 * @method onInfoPress 
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent caller
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.onInfoPress = function (oEvent) {
		var oControl = oEvent.getSource();
		var oCtx = this.getSetting("oItem").getBindingContext("tree");
		// create popover
		if (!this._oPopover) {
			Fragment.load({
				name: "be.infrabel.psd.view.fragment.AdministrativeData",
				controller: this
			}).then(function (oFragment) {
				this._oPopover = oFragment;
				this.getView().addDependent(this._oPopover);
				this._oPopover.setBindingContext(oCtx, "tree");
				this._oPopover.openBy(oControl);
			}.bind(this));
		} else {
			this._oPopover.openBy(oControl);
		}
	};
	/**
	 * close administrative data popover
	 * @method onInfoPress 
	 * @public
	 * @instance
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.onExitAdministrativeData = function () {
		this._oPopover.close();
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
		const oSource = oEvent.getSource();
		this.getFragment(this._oMessagePopover, "be.infrabel.psd.view.fragment.MessagePopover")
			.then(function (oFragment) {
				this._oMessagePopover = oFragment;
				oFragment.openBy(oSource);
			}.bind(this));
	};
	/**
	 * get Fragment
	 * @method get Fragment
	 * @public
	 * @instance		
	 * @return {promise} a promise
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.getFragment = function (oFragmentBuffer, sFragmentName) {
		// create popover lazily
		return new Promise(function (resolve, reject) {
			if (!oFragmentBuffer) {
				Fragment.load({
						name: sFragmentName,
						controller: this
					}).then(function (oFragment) {
						this.getView().addDependent(oFragment);
						resolve(oFragment);
					}.bind(this))
					.catch(function (oError) {
						reject(oError);
					}.bind(this));

			} else {
				resolve(oFragmentBuffer);
			}
		}.bind(this));
	};
	/**
	 * initialize
	 * @method initialize
	 * @public
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.initialize = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		var oModel = this.getModel("main");
		if (oModel.hasPendingChanges()) {
			oModel.resetChanges()
		};
		var oSettings = this.getModel("global").getData();
		oSettings.isValid = false;
		oSettings.toSave = false;
		oSettings.error = false;
		oSettings.edit = false;
		oSettings.displayOnly = false;
		oSettings.approved = false;
		oSettings.busy = false;
		oSettings.oItem = null;
		oSettings.newPartners = [];
		oSettings.newGeoLoc = [];
		oSettings.wfComment = "";
		if (oSettings.oInvestmentComponent) {
			oSettings.oInvestmentComponent.setEditMode(false)
		};
		if (oSettings.oPartnerComponent) {
			oSettings.oPartnerComponent.setEditMode(this.getSetting("edit"));
		}
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
	 * check if date is valid
	 * @method onDateChange
	 * @public
	 * @param {sap.ui.base.Event} oEvent caller* 
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.onDateChange = function (oEvent) {
		if (oEvent.getParameter("valid")) {
			oEvent.getSource().setValueState("None");
		} else {
			oEvent.getSource().setValueState("Error");
		}
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
	 * load tree view if not yet done	
	 * @method loadTree
	 * @public	  
	 * @param {sap.ui.base.Event} oEvent caller
	 * @instance		
	 * @author Christophe Taymans
	 **/
	oBaseController.prototype.loadTree = function (oEvent) {
		if (this.getSetting("treeLoaded")) {
			return;
		}
		const oArgument = oEvent.getParameter("arguments");
		this.navTo("ProjectStructureRoute", {
			projectId: oArgument.projectId,
			mode: oArgument.mode,
			originPath: oArgument.path
		});
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
	 * load profile for application
	 * @method loadProfile
	 * @public
	 * @returns {promise} the load promise
	 * @author Christophe Taymans
	 */
	oBaseController.prototype.loadProfile = function () {
		return new Promise(function (resolve, reject) {
			if (this.getSetting("profileLoaded")) {
				resolve();
				return;
			}
			const oModel = this.getOwnerComponent().getModel("main");
			oModel.metadataLoaded().then(function () {
				this.setBusy(true);
				const sPath = oModel.createKey("/ProfileSet", {
					ProfileId: this.getSetting("profileId")
				});
				oModel.read(sPath, {
					urlParameters: {
						"$expand": "ToFilter,ToAction"
					},
					success: function (oData) {
						this.setSetting("projectProfile", oData.ProjectProfile);
						this.setSetting("worklistFilter", oData.ToFilter.results);
						this.setSetting("worklistAction", oData.ToAction.results);
						if (oData.ToFilter.results.length) {
							//select the first filter of the profile and store it as active
							this.setSetting("worklistFilterKey", oData.ToFilter.results[0].FilterId);
						}
						this.setSetting("profileLoaded", true);
						this.setBusy(false);
						resolve(sPath);
					}.bind(this),
					Error: function () {
						this.setSetting("projectProfile", undefined);
						this.setSetting("worklistFilter", []);
						reject();
						this.setBusy(false);
					}.bind(this)
				});
			}.bind(this));
		}.bind(this));
	};
	/**
	 * cross navigation
	 * @method crossNavigate
	 * @public
	 * @param {string} sSemanticObject - the semantic object
	 * @param {string} sSemanticAction - the semantic action
	 * @param {object} oParameters - navigation parameter
	 * @author Christophe Taymans
	 */
	oBaseController.prototype.crossNavigate = function (sSemanticObject, sSemanticAction, oParameters) {
		const oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
		const hash = (sap.ushell && sap.ushell.Container &&
			sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sSemanticAction
				},
				params: oParameters
			})) || "";
		oCrossAppNavigator.toExternal({
			target: {
				shellHash: hash
			}
		});
	};
	// /**
	//  * lock project
	//  * @method lockProject
	//  * @public
	//  * @returns {promise} the load promise
	//  * @author Christophe Taymans
	//  */
	// oBaseController.prototype.lockProject = function () {
	// 	return new Promise(function (resolve, reject) {
	// 		this.getModel("main").callFunction("/lock", {
	// 			urlParameters: {
	// 				ProjectID: this.getSetting("projectId"),
	// 				ProfileId: this.getSetting("profileId"),
	// 				Lock: true
	// 			},
	// 			success: function (oData) {
	// 				this.setSetting("error", false);
	// 				this.setBusy(false);
	// 				resolve();
	// 			}.bind(this),
	// 			error: function () {
	// 				this.setSetting("error", true);
	// 				this.setBusy(false);
	// 				reject();
	// 			}.bind(this),
	// 		});
	// 	}.bind(this));
	// };
	return oBaseController;
});
