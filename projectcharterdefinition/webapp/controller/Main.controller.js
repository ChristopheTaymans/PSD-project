sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/message/Message"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox, Fragment, Message) {
	"use strict";

	return BaseController.extend("be.infrabel.pcd.controller.Main", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the main controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("mainRoute").attachPatternMatched(this._onMainMatched, this);
		},

		/**
		 * Binds the view to the  path and expands the aggregated line items.
		 * @method _onMainMatched
		 * @private
		 * @instance	
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
		 * @memberof  be.infrabel.psd.controller.Worklist
		 * @author Christophe Taymans
		 **/

		_onMainMatched: function (oEvent) {
			let startupParams = this.getOwnerComponent().getComponentData().startupParameters; // get Startup params from Owner Component
			if ((startupParams.projectID && startupParams.projectID[0])) {
				this.setSetting("projectId", startupParams.projectID[0]);
				this._refreshProject();
			} else {
				let sProjectID = jQuery.sap.getUriParameters().get("projectID");
				if (!sProjectID) {
					MessageToast.show(this.getText("InitErrorMessage"));
				} else {
					this.setSetting("projectId", sProjectID);
					this._refreshProject();
				}
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's Stakeholder 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onStakeholderUpdateFinished: function (oEvent) {
			this.setBusy(false);
		},


		/**
		 * Triggered by the table's Milestones 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onMilestoneUpdateFinished: function (oEvent) {
			this.setBusy(false);
		},

		/**
		 * Event handler when button add Stakeholder is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddStakeholder: function (oEvent) {
			this._Popup(oEvent, true, "Stakeholder");
		},

		/**
		 * Event handler when button add Risks is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddRisk: function (oEvent) {
			this._Popup(oEvent, true, "Risk");
		},

		/**
		 * Event handler when button add Cost Center is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddCostCenter: function (oEvent) {
			this._Popup(oEvent, true, "CostCenter");
		},

		/**
		 * Event handler when button add Priority is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddPriority: function (oEvent) {
			this._Popup(oEvent, true, "Work");
		},

		/**
		 * Event handler when button add Linked project is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddLinkedProject: function (oEvent) {
			this._Popup(oEvent, true, "LinkedProject");
		},

		/**
		 * Event handler when button add Linked project is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddMilestone: function (oEvent) {
			//this._Popup(oEvent, true, "Milestone");
			this._isComplete(oEvent,"Add");
		},

		/**
		 * Event handler when button delete Stakeholder is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onDelete: function (oEvent) {
			this._MessageBoxDelete(oEvent);
		},

		/**
		 * Event handler when button delete Stakeholder is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onGenerateMilestones: function (oEvent) {
			this._isComplete(oEvent,"Generate");
		},

		/**
		 * Event handler when button edit Stakeholder is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onEditStakeholder: function (oEvent) {
			this._Popup(oEvent, false, "Stakeholder");
		},

		/**
		 * Event handler when button edit Risks is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onEditRisk: function (oEvent) {
			this._Popup(oEvent, false, "Risk");
		},

		/**
		 * Event handler when button edit Cost Center is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		// onEditCostCenter: function (oEvent) {
		// 	let nPercentage = this._getPercentageCostCenter();
		// 	let oContext = oEvent.getSource().getParent().getBindingContext("main");
		// 	nPercentage = nPercentage - Number(oContext.getProperty("Percentage"));
		// 	this.setSetting("percentage", nPercentage);
		// 	this._Popup(oEvent, false, "CostCenter");
		// },

		/**
		 * Event handler when button edit Priority is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onEditPriority: function (oEvent) {
			this._Popup(oEvent, false, "Work");
		},

		/**
		 * Event handler when button edit Linked project is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onEditLinkedProject: function (oEvent) {
			this._Popup(oEvent, false, "LinkedProject");
		},

		/**
		 * Event handler when button edit Linked project is pressed
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onEditMilestone: function (oEvent) {
			this._Popup(oEvent, false, "Milestone");
		},

		/**
		 * On the popup of the entity, when the user press the close button
		 * @method onPopupClose
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onPopupClose: function (oEvent) {
			let oContext = this._oPopup.getBindingContext("main");
			let bAdd = this.getSetting("Add");
			if (bAdd === true) {
				this.getModel("main").deleteCreatedEntry(oContext);
			} else {
				let aPath = [oContext.sPath];
				this.getModel("main").resetChanges(aPath);
			};
			this._oPopup.close();
		},

		/**
		 * On the popup of the entity, when the user press the save button
		 * @method onPopupSave
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onPopupSave: function (oEvent) {
			let oModel = this.getModel("main");
			let bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (this._checkData() === true) {
				if (oModel.hasPendingChanges()) {
					this._oPopup.setBusy(true);
					oModel.submitChanges({
						success: function (oData) {
							this.setChanged(false);
							sap.ui.getCore().getMessageManager().removeAllMessages();
							MessageToast.show(this.getText("entrySaved"));
							this.getModel("main").refresh(true);
							this._oPopup.setBusy(false);
							this._oPopup.close();
						}.bind(this),
						error: function (oError) {
							MessageBox.error(this.getText("saveError"), {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							});
							this._oPopup.setBusy(false);
							this._oPopup.close();
						}.bind(this)
					})
				}
				// this._oPopup.setBusy(false);
				// this._oPopup.close();
			}
		},

		/**
		 * On input WBS, when the user requests the valuehelp
		 * @method onValueHelpWbs
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onValueHelpWbs: function (oEvent) {
			this.setSetting("InputId", "inputwbs2ID");
			this.setSetting("object", "WbsID");
			this._ValueHelp(oEvent, "be.infrabel.pcd.view.fragment.WbsSearchHelpDialog")
		},

		/**
		 * Search for a specific WBS in the valuehelp of WBS
		 * @method onWbsSearch
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onWbsSearch: function (oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilterDescription = new Filter("Description", sap.ui.model.FilterOperator.Contains, sValue);
			let oFilterWbsId = new Filter("WbsID", sap.ui.model.FilterOperator.Contains, sValue);
			let oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(new Filter({
				filters: [
					oFilterDescription,
					oFilterWbsId
				],
				and: false
			}), sap.ui.model.FilterType.Control);
		},

		/**
		 * When the user confirms or cancel the dialg for the valuehelp
		 * @method onSave 
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onValueHelpClose: function (oEvent) {
			//debugger;
			let oSelectedItem = oEvent.getParameter("selectedItem");
			//Check if the user has selected an item, otherwise he has simply closed the value help
			if (!oSelectedItem) {
				return;
			}

			//Set the value in the input field
			let sObject = this.getSetting("object");
			let oSelectedData = oSelectedItem.getBindingContext("main").getObject(sObject);
			let sId = this.getSetting("InputId");
			let sFragmentId = this._getFragmentID();
			let oInput = sap.ui.core.Fragment.byId(sFragmentId, sId);
			if (oInput) {
				oInput.setValueState("None");
				if (oSelectedItem) {
					oInput.setValue(oSelectedData);
				}
			};
		},

		/**
		 * When the user clicks the button save
		 * All pending changes will be saved to the backend
		 * @method onSave 
		 * @public
		 * @instance	
		 * @param {object} oEvent
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		onSave: function (oEvent) {
			let oModel = this.getModel("main");
			let bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (oModel.hasPendingChanges()) {
				this.getView().setBusy(true);
				oModel.submitChanges({
					success: function (oData) {
						this.setChanged(false);
						MessageToast.show(this.getText("projectSaved"));
						this.getView().setBusy(false);
					}.bind(this),
					error: function (oError) {
						MessageBox.error(this.getText("projectError"), {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						});
						this.getView().setBusy(true);
					}.bind(this)
				})
			}
		},

		onChangeDate: function (oEvent) {
			let sDate = oEvent.getParameter("value");
			let oInputDuration = this.byId(Fragment.createId("fragmentPopupMilestoneID", "inputDurationID"));
			let nDuration = Number(oInputDuration.getProperty("value"));
			this._setBasicFixDate(sDate, nDuration);
		},

		onChangeDuration: function (oEvent) {
			let nDuration = oEvent.getParameter("value");
			let dDate = this._oPopup.getBindingContext("main").getProperty("Startdate");
			let sDate = [dDate.getFullYear(),
				this._zeroPad(dDate.getDate(), 10),
				this._zeroPad(dDate.getMonth() + 1, 10)
			].join(".");
			this._setBasicFixDate(sDate, nDuration);
		},

		onChange: function (oEvent) {
			this.setChanged(true);
		},

		/**
		 * translate Message target 
		 * @method translateMessageTarget
		 * @public	  
		 * @instance		
		 * @author Christophe Taymans/Pepijn Vanderlinden
		 **/
		translateMessageTarget: function () {
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
		},

		/**
		 * add a message to mesage manager
		 * @method addMessage
		 * @public
		 * @param {string} sMessage message text
		 * @param {sap.ui.core.MessageType} sType message type
		 * @instance		
		 * @author Christophe Taymans/Pepijn Vanderlinden
		 **/
		addMessage: function (sTarget, sMessage, sType) {
			sap.ui.getCore().getMessageManager().addMessages(new Message({
				description: sTarget ? sTarget + " : " : undefined,
				message: sMessage,
				type: sType
			}));
		},

		onChangeRequired: function (oEvent) {
			let sId = oEvent.getParameter("id");
			let oInput = sap.ui.getCore().byId(sId);
			if (oEvent.getParameter("value") === "") {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				oInput.setValueStateText(this.getText("requiredfield"));
			} else {
				oInput.setValueState(sap.ui.core.ValueState.None);
			}
		},

		onPSD: function () {
		const oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
		const hash = (sap.ushell && sap.ushell.Container &&
			sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
				target: {
					semanticObject: "PSD",
					action: "manage"
				},
				params: {
					"projectId": this.getSetting("projectId")
				}
			})) || "";
		oCrossAppNavigator.toExternal({
			target: {
				shellHash: hash
			}
		});
	 },
	 onPSDCockpit: function () {
		const oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
		const hash = (sap.ushell && sap.ushell.Container &&
			sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
				target: {
					semanticObject: "PSD",
					action: "manage"
				}
			})) || "";
		oCrossAppNavigator.toExternal({
			target: {
				shellHash: hash
			}
		});
	 },	 

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Valuehelp for WBS2
		 * @method _ValueHelp
		 * @private
		 * @instance	
		 * @param {object} oEvent
		 *		  {string} sFragment
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		_ValueHelp: function (oEvent, sFragment) {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: sFragment,
					type: "XML",
					controller: this
				}).then(function (oFragment) {
					this.getView().addDependent(oFragment);
					oFragment.open();
					this._oValueHelpDialog = oFragment;
				}.bind(this));
			} else {
				this._oValueHelpDialog.open();
			}
		},

		/**
		 * Creates a popup for any table
		 * @method _Popup
		 * @private
		 * @instance	
		 * @param {object} oEvent
		 *        {boolean} bAdd
		 *		  {string} sFragment
		 * @returns
		 * @author Pepijn Vanderlinden
		 **/
		_Popup: function (oEvent, bAdd, sFragment) {
			this.setSetting("Add", bAdd);
			let sId = this._getFragmentID(sFragment);
			let oContext;
			if (bAdd === false) {
				oContext = oEvent.getSource().getParent().getBindingContext("main");
			};

			/* Load the fragment Popup */
			let sFragmentName = "be.infrabel.pcd.view.fragment.Popup" + sFragment;
			Fragment.load({
				name: sFragmentName,
				type: "XML",
				controller: this,
				id: sId
			}).then(function (fragmentPopup) {
				this.getView().addDependent(fragmentPopup);
				if (bAdd === true) {
					oContext = this._getContext(sFragment);
				};
				fragmentPopup.setBindingContext(oContext, "main");
				/* Make sure that we destroy the Dialog after it's closed */
				fragmentPopup.attachAfterClose(fragmentPopup.destroy);
				fragmentPopup.open();
				this._oPopup = fragmentPopup;
			}.bind(this));
		},

		/**
		 * Return the context to create a new entity in the popup
		 * @method _getContext
		 * @private
		 * @instance	
		 * @param {string} sFragment
		 * @returns {object} oContext
		 * @author Pepijn Vanderlinden
		 **/
		_getContext: function (sFragment) {
			let oContext;
			let vEntity = "/" + sFragment + "Set";
			oContext = this.getModel("main").createEntry(vEntity, {
				properties: {
					ProjectID: this.getSetting("projectId")
				}
			});
			if (sFragment === "Milestone") {
				let dStartdate = this.getModel("main").getProperty("/ProjectSet('" + this.getSetting("projectId") + "')").StartDateWork;
				this.getModel("main").setProperty(oContext.sPath + "/Startdate", dStartdate, oContext);
				this.getModel("main").setProperty(oContext.sPath + "/BasicFixDate", dStartdate, oContext);
			}
			return oContext;
		},

		/**
		 * Messagebox that asks the user if he wants to delete the selected entity
		 * @method _MessageBoxDelete
		 * @private
		 * @instance	
		 * @param {listItem} listItem
		 * @returns 
		 * @author Pepijn Vanderlinden
		 **/
		_MessageBoxDelete: function (oEvent) {
			const oListItem = oEvent.getParameter("listItem");
			MessageBox.show(
				this.getText("questionDelete"), {
					icon: MessageBox.Icon.QUESTION,
					title: this.getText("deleteEntry"),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (sAnswer) {
						if (sAnswer === MessageBox.Action.YES) {
							this._DeleteEntry(oListItem);
						}
					}.bind(this)
				});
		},

		/**
		 * Messagebox that asks the user if he wants to generate the milestones automatically
		 * @method _MessageBoxGenerate
		 * @private
		 * @instance	
		 * @param {object} oEvent
		 * @returns 
		 * @author Pepijn Vanderlinden
		 **/
		_MessageBoxGenerate: function () {
			// We first check if the start date is filled in			
			let dStartdate = this.getModel("main").getProperty("/ProjectSet('" + this.getSetting("projectId") + "')").StartDateWork;
			if (!dStartdate) {
				// In case the start date is not filled in we trigger an error message
				MessageBox.show(
					this.getText("errordateGenerateMilestones"), {
						icon: MessageBox.Icon.ERROR,
						title: this.getText("titleGenerateMilestones"),
						actions: [MessageBox.Action.CLOSE],
						onClose: function (sAnswer) {

						}.bind(this)
					});
			} else {
				MessageBox.show(
					this.getText("questionGenerateMilestones"), {
						icon: MessageBox.Icon.QUESTION,
						title: this.getText("titleGenerateMilestones"),
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function (sAnswer) {
							if (sAnswer === MessageBox.Action.YES) {
								this._GenerateMilestones();
							}
						}.bind(this)
					});
			}
		},

		/**
		 * This will delete any entity that has been selected in the tables for deletion
		 * @method _DeleteEntry
		 * @private
		 * @instance	
		 * @param {object} listItem
		 * @returns 
		 * @author Pepijn Vanderlinden
		 **/
		_DeleteEntry: function (oListItem) {
			this.setBusy(true, 0);
			let oModel = this.getModel("main");
			oModel.remove(oListItem.getBindingContextPath(), {
				success: function (oData) {
					this.setBusy(false);
					MessageToast.show(this.getText("deleteEntrySuccess"));
					sap.ui.getCore().getMessageManager().removeAllMessages();
					this.getModel("main").refresh(true);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
					MessageBox.error(this.getText("saveError"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					});
				}.bind(this)
			})
		},

		/**
		 * This will refresh the project when the app is called
		 * @method _refreshProject
		 * @private
		 * @instance	
		 * @param 
		 * @returns 
		 * @author Pepijn Vanderlinden
		 **/
		_refreshProject: function () {
			let sObjectPath = this.getModel("main").createKey("/ProjectSet", {
				ProjectID: this.getSetting("projectId")
			});
			this.setBusy(true, 0);
			this.getView().bindElement({
				path: sObjectPath,
				model: "main"
			});
			this.setSetting("edit", true);
		},

		/**
		 * This will call a function in the backend to (re)generate the milestones automatically
		 * @method _GenerateMilestones
		 * @private
		 * @instance	
		 * @param 
		 * @returns 
		 * @author Pepijn Vanderlinden
		 **/
		_GenerateMilestones: function () {
			let oModel = this.getModel("main");
				
			//Call the generate milstones function
			this.setBusy(true, 0);
			oModel.callFunction("/GenerateMilestones", {
				method: "GET",
				urlParameters: {
					ProjectID: this.getSetting("projectId")
				},
				success: function (oData, response) {
					this.getModel("main").refresh(true);
				}.bind(this)
			});
		},

		/**
		 * Save the fragment if it's given and return the fragment ID for the popup
		 * @method _getFragmentID
		 * @private
		 * @instance	
		 * @param {string} sFragment
		 * @returns {string} fragment ID
		 * @author Pepijn Vanderlinden
		 **/
		_getFragmentID: function (sFragment) {
			let sFragmentId = "";
			//In case the fargment is given we will temporary save it for future use
			if (sFragment) {
				this.setSetting("fragment", sFragment);
				sFragmentId = sFragment;
			} else {
				sFragmentId = this.getSetting("fragment");
			}
			//Return the fragment ID for the popup
			sFragmentId = "fragmentPopup" + sFragmentId + "ID";
			return this.getView().createId(sFragmentId);
		},

		/**
		 * aggregate Message from message handler
		 * @method _aggregateMessage
		 * @private	  
		 * @instance		
		 * @author Christophe Taymans/Pepijn Vanderlinden
		 **/
		_aggregateMessage: function () {
			const aMessages = this.getModel("message").getData().reduce(function (newArray, oMessage) {
				if (!newArray.some(function (row) {
						return oMessage.message === row.message && oMessage.description === row.description;
					})) {
					newArray.push(oMessage)
				}
				return newArray;
			}.bind(this), [])
			this.getModel("message").setData(aMessages);
		},

		/**
		 * set Basic fix date based on start date and duration
		 * @method _setBasicFixDate
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_setBasicFixDate: function (sDate, nDuration) {
			//debugger;
			let sWorkdate = sDate.split(".").reverse().join(".");
			let dDate = new Date(sWorkdate);
			let nDays = Number(nDuration) - Number(1);
			dDate.setDate(dDate.getDate() - nDays || 1);
			let sDateNew = [dDate.getFullYear(),
				this._zeroPad(dDate.getMonth() + 1, 10),
				this._zeroPad(dDate.getDate(), 10)
			].join(".");
			let oModel = this.getModel("main");
			let sPath = this._oPopup.getBindingContext("main").getPath();
			sPath = sPath + "/BasicFixDate";
			let dBasicFixDate = new Date(sDateNew);
			oModel.setProperty(sPath, dBasicFixDate);
		},

		/**
		 * padding of zeroes
		 * @method _zeroPad
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_zeroPad: function (nNumber, nBase) {
			let nLength = (String(nBase).length - String(nNumber).length) + 1;
			return nLength > 0 ? new Array(nLength).join("0") + nNumber : nNumber;
		},

		/**
		 * check input data of the popup's
		 * @method _checkData
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkData: function () {
			let sFragment = this.getSetting("fragment");
			let bCheck = false;

			switch (sFragment) {
			case "Stakeholder":
				bCheck = this._checkStakeholder();
				break;
			case "Risk":
				bCheck = this._checkRisk();
				break;
			case "CostCenter":
				bCheck = this._checkCostCenter();
				break;
			case "Work":
				bCheck = this._checkWork();
				break;
			case "LinkedProject":
				bCheck = this._checkLinkedProject();
				break;
			case "Milestone":
				bCheck = this._checkMilestone();
				break;
			default:
			};
			return bCheck;
		},

		/**
		 * check input data of the stakeholder data
		 * @method _checkStakeholder
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkStakeholder: function () {
			//Check if a stakeholder has been filled in
			let oInputStakeHolder = this.byId(Fragment.createId("fragmentPopupStakeholderID", "inputStakeholderID"));

			if (oInputStakeHolder.getProperty("value") === "") {
				oInputStakeHolder.setValueState(sap.ui.core.ValueState.Error);
				oInputStakeHolder.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputStakeHolder.setValueState(sap.ui.core.ValueState.None);
				return true;
			}

		},

		/**
		 * check input data of the risk data
		 * @method _checkRisk
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkRisk: function () {
			//Check if a risk type is selected
			let oComboType = this.byId(Fragment.createId("fragmentPopupRiskID", "comboboxTypeID"));

			if (oComboType.getProperty("value") === "") {
				oComboType.setValueState(sap.ui.core.ValueState.Error);
				oComboType.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oComboType.setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},

		/**
		 * check input data of the Cost Center data
		 * @method _checkCostCenter
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		// _checkCostCenter: function () {
		// 	//Check input field of the Cost Center
		// 	let oInputCostCenter = this.byId(Fragment.createId("fragmentPopupCostCenterID", "inputCostCenterID"));

		// 	if (oInputCostCenter.getProperty("value") === "") {
		// 		oInputCostCenter.setValueState(sap.ui.core.ValueState.Error);
		// 		oInputCostCenter.setValueStateText(this.getText("requiredfield"));
		// 		return false;
		// 	} else {
		// 		oInputCostCenter.setValueState(sap.ui.core.ValueState.None);
		// 	}

		// 	//Check input field of the percentage and the total percentage
		// 	let bAdd = this.getSetting("Add");
		// 	let nPercentage = 0;
		// 	if (bAdd === true) {
		// 		nPercentage = this._getPercentageCostCenter();
		// 	} else {
		// 		nPercentage = Number(this.getSetting("percentage"));
		// 	}

		// 	let oInputPercentage = this.byId(Fragment.createId("fragmentPopupCostCenterID", "inputPercentageID"));

		// 	if (oInputPercentage.getProperty("value") === "") {
		// 		oInputPercentage.setValueState(sap.ui.core.ValueState.Error);
		// 		oInputPercentage.setValueStateText(this.getText("requiredfield"));
		// 		return false;
		// 	} else {
		// 		oInputPercentage.setValueState(sap.ui.core.ValueState.None);
		// 	}

		// 	nPercentage = nPercentage + Number(oInputPercentage.getProperty("value"));

		// 	if (nPercentage !== 100) {
		// 		// In case the start date is not filled in we trigger an error message
		// 		MessageBox.show(
		// 			this.getText("warningPercentage"), {
		// 				icon: MessageBox.Icon.WARNING,
		// 				title: this.getText("tableCostCenterTitle"),
		// 				actions: [MessageBox.Action.CLOSE],
		// 				onClose: function (sAnswer) {

		// 				}.bind(this)
		// 			});
		// 	}
		// 	return true;

		// },

		/**
		 * Calculate the total percentage of the different cost centers
		 * @method _getPercentageCostCenter
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		// _getPercentageCostCenter: function () {
		// 	//Loop through the table of cost centers and calculate the total percentage
		// 	let oTable = this.getView().byId("tableCostCenterID");
		// 	let items = oTable.getItems();
		// 	let nPercentage = 0;

		// 	for (let i = 0; i < items.length; i++) {
		// 		nPercentage = nPercentage + Number(items[i].getCells()[3].getText());
		// 	}
		// 	return nPercentage;
		// },

		/**
		 * check input data of the work data
		 * @method _checkWork
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkWork: function () {
			// Check if a priority has been selected
			let oComboPriority = this.byId(Fragment.createId("fragmentPopupWorkID", "comboboxPriorityID"));

			if (oComboPriority.getProperty("value") === "") {
				oComboPriority.setValueState(sap.ui.core.ValueState.Error);
				oComboPriority.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oComboPriority.setValueState(sap.ui.core.ValueState.None);
			}

			// Check if a motivation has been filled in
			let oInputMotivation = this.byId(Fragment.createId("fragmentPopupWorkID", "inputMotivationID"));

			if (oInputMotivation.getProperty("value") === "") {
				oInputMotivation.setValueState(sap.ui.core.ValueState.Error);
				oInputMotivation.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputMotivation.setValueState(sap.ui.core.ValueState.None);
			}
			return true;
		},

		/**
		 * check input data of the Linked Project data
		 * @method _checkLinkedProject
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkLinkedProject: function () {
			// Check if a linked project has been selected
			let oInputLinkedProject = this.byId(Fragment.createId("fragmentPopupLinkedProjectID", "inputLinkedProjectID"));

			if (oInputLinkedProject.getProperty("value") === "") {
				oInputLinkedProject.setValueState(sap.ui.core.ValueState.Error);
				oInputLinkedProject.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputLinkedProject.setValueState(sap.ui.core.ValueState.None);
			}

			// Check if a managing service has been selected
			let oInputManagingService = this.byId(Fragment.createId("fragmentPopupLinkedProjectID", "inputManagingServiceID"));
			if (oInputManagingService.getProperty("value") === "") {
				oInputManagingService.setValueState(sap.ui.core.ValueState.Error);
				oInputManagingService.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputManagingService.setValueState(sap.ui.core.ValueState.None);
			}
			return true;
		},

		/**
		 * check input data of the Milestone data
		 * @method _checkMilestone
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_checkMilestone: function () {
			let oInputWbs = this.byId(Fragment.createId("fragmentPopupMilestoneID", "inputwbs2ID"));
			if (oInputWbs.getProperty("value") === "") {
				oInputWbs.setValueState(sap.ui.core.ValueState.Error);
				oInputWbs.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputWbs.setValueState(sap.ui.core.ValueState.None);
			}

			let oInputUsage = this.byId(Fragment.createId("fragmentPopupMilestoneID", "inputUsageID"));
			if (oInputUsage.getProperty("value") === "") {
				oInputUsage.setValueState(sap.ui.core.ValueState.Error);
				oInputUsage.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				oInputUsage.setValueState(sap.ui.core.ValueState.None);
			}
			
			let dDate = this.byId(Fragment.createId("fragmentPopupMilestoneID", "datepickerStartDateWorkID"));
			if ( dDate.getDateValue() == null ){
				dDate.setValueState(sap.ui.core.ValueState.Error);
				dDate.setValueStateText(this.getText("requiredfield"));
				return false;
			} else {
				dDate.setValueState(sap.ui.core.ValueState.None);
			}
			
			return true;
		},

		/**
		 * check if the total percentage of cost centers is equal to 100%
		 * @method _checkPercentageCostCenters
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		// _checkPercentageCostCenters: function () {
		// 	let oTable = this.getView().byId("tableCostCenterID");
		// 	let items = oTable.getItems();
		// 	let nPercentage = 0;

		// 	for (let i = 0; i < items.length; i++) {
		// 		nPercentage = nPercentage + Number(items[i].getCells()[3].getText());
		// 	}

		// 	if (nPercentage !== 100 && items.length > 0) {
		// 		this.addMessage(this.getText("tableCostCenterIDColumnTitle"), this.getText("warningPercentage"), sap.ui.core.MessageType.Error)
		// 	}
		// },
	
		/**
		 * check if the PSD is complete, that WBS 2 elements exists
		 * @method _isComplete
		 * @private	  
		 * @instance		
		 * @author Pepijn Vanderlinden
		 **/
		_isComplete: function (oEvent, sAction) {

			let oModel = this.getModel("main");
			const cAction = sAction;
			
			//Call the CheckComplete function
			this.setBusy(true, 0);
			oModel.callFunction("/CheckComplete", {
				method: "GET",
				urlParameters: {
					ProjectID: this.getSetting("projectId")
				},
				success: function (oData, response) {
					this.setBusy(false, 0);
					let bComplete = oData.CheckComplete.IsPsdComplete;
					let bHasSpecialty = oData.CheckComplete.HasSpeciality;
					if (bComplete === "X" && bHasSpecialty === "X") {
						switch (cAction) {
							case "Add":
								this._Popup(oEvent, true, "Milestone");
								break;
							case "Generate":
								this._MessageBoxGenerate();
								break;
						};
					} else {
						let sMessage = "";
						switch ("") {
							case bComplete:
								sMessage = this.getText("errorCheckPsd");
								break;
							case bHasSpecialty:
								sMessage = this.getText("errorNoSpecialty");
								break;
						}
						MessageBox.show(
								sMessage, {
								icon: MessageBox.Icon.ERROR,
								title: this.getText("milestoneDialog"),
								actions: [MessageBox.Action.CLOSE],
								onClose: function (sAnswer) {

								}.bind(this)
							});
					}
				}.bind(this)
			});
		}
	});
});