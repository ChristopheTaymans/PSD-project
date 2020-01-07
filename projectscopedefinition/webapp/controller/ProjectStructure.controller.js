sap.ui.define([
	"be/infrabel/psd/controller/WbsBaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (WbsBaseController, MessageToast, MessageBox, Fragment) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.WbsBaseController
	 * @name        be.infrabel.psd.controllers.ProjectStructure
	 * @class       be.infrabel.psd.controllers.ProjectStructure
	 * oController 
	 */
	var oController = WbsBaseController.extend("be.infrabel.psd.controller.ProjectStructure", /**@lends be.infrabel.psd.controllers.ProjectStructure.prototype **/ {
		_confirmFragment: undefined
	});
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		//WbsBaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("ProjectStructureRoute").attachPatternMatched(this._onObjectMatched, this);
		//subsribe an event in order to refresh tree from other controller
		this.getOwnerComponent().getEventBus().subscribe("treeRefresh", function () {
			this.byId("projectstructureTreeId").getModel("tree").refresh(true);
		}.bind(this));
		// subscribe event for any change on the tree model
		this.getOwnerComponent().getModel("main").attachPropertyChange(function (oEvent) {
			if (this.getSetting("edit")) {
				if (oEvent.getParameter("path") === "Node") {
					var oMainModel = this.getModel("main");
					var oTreeModel = this.getTreeModel();
					var oMainData = oMainModel.getObject(oEvent.getParameter("context").getPath());
					var sTreePath = this.getSetting("oItem").getBindingContext("tree").getPath();
					var oTreeBranch = oTreeModel.getObject(sTreePath);
					oTreeBranch.Node = oMainData.Node;
					oTreeBranch.levels.forEach(function (oData) {
						oData.ParentNode = oMainData.Node;
						var sPath = oMainModel.createKey("/WbsSet", {
							NodeID: oData.NodeID,
							Type: oData.Type
						}) + "/ParentNode";
						oMainModel.setProperty(sPath, oMainData.Node);
					}.bind(this));
				}
				this._isChangeOccured();
				this.isTreeDataValid();
			}
		}.bind(this));

		this.getOwnerComponent().getService("ShellUIService").then(function(oShellService) {
			oShellService.setBackNavigation(function() {
				this.checkBeforeExit().then(function () {
					this.onNavBack();
				}.bind(this))
			}.bind(this));
		}.bind(this));	
	
	};
	/**
	 * called at controler exit
	 * @method onExit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.ProjectStructure
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onExit = function () {
		if (this._confirmFragment) {
			this._confirmFragment.destroy();
		}
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function (oEvent) {
		this.initialize();
		var sProjectId = oEvent.getParameter("arguments").projectId;
		var sMode = oEvent.getParameter("arguments").mode;
		this._originPath = oEvent.getParameter("arguments").originPath;
		this.setSetting("edit", (sMode === "Edit" || sMode === "New"));
		this.setSetting("error", false);
		this.setSetting("projectId", sProjectId);
		this._refreshTree().then(function () {
			this.setSetting("treeLoaded", true);
			if (sMode === "New") {
				var sProjectNodeData = this.getTreeModel().getProperty("/project/levels/0");
				this.createWBS(sProjectNodeData);
				this.getTreeModel().refresh();
				this._isChangeOccured();
				this.isTreeDataValid();
			};
		}.bind(this));
	};
	/**
	 * build / refresh Tree.
	 * @method _refreshTree
	 * @private
	 * @instance
	 * @returns {promise} - a promise
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._refreshTree = function () {
		return new Promise(function (resolve, reject) {
			this.getOwnerComponent().getModel("main").metadataLoaded().then(function () {
				var oModel = this.getModel("main");
				var sObjectPath = this.getModel("main").createKey("/ProjectSet", {
					NodeID: this.getSetting("projectId"),
					Type: "P"
				}) + '/Tree';
				this.setBusy(true);
				oModel.read(sObjectPath, {
					urlParameters: {
						"$expand": "ProjectSet,WbsSet"
					},
					success: function (oData) {
						this.onSuccessRead(oData);
						resolve();
					}.bind(this),
					error: function (oError) {
						this.setBusy(false);
						this.showError(oError, true);
						reject();
					}.bind(this)
				});
			}.bind(this));
		}.bind(this));
	};
	/**
	 * on edit
	 * @method onEdit
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onEdit = function () {
		this.setSetting("error", false);
		this.setSetting("edit", true);

		var oInvestmentComponent = this.getSetting("oInvestmentComponent");
		if (oInvestmentComponent) {
			oInvestmentComponent.setEditMode(true)
		};
		var oPartnerComponent = this.getSetting("oPartnerComponent");
		if (oPartnerComponent) {
			oPartnerComponent.setEditMode(true);
		}
		this._showItem(this.getSetting("oItem"));
	};
	/**
	 * on create project
	 * @method onCreateProject
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCreateProject = function () {
		this._confirmAndComment(true).then(function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
			this._save()
				.then(function () {
					this._createProject(false)
						.then(function (newProjectId) {
							MessageToast.show(this.getText("CreateSuccessMessage", [newProjectId]), {
								closeOnBrowserNavigation: false
							})
							if (this.getSetting("inboxCalled")) {
								if (this.getOwnerComponent().getComponentData()["onTaskUpdate"]) {
									this.getOwnerComponent().getComponentData().onTaskUpdate();
								}
								this.onNavBack();
							} else {
								this.navTo("worklistRoute");
							}
						}.bind(this))
						.catch(function () {
							this.setSetting("error", true);
							MessageToast.show(this.getText("CreateErrorMessage"));
						}.bind(this))
				}.bind(this))
				.catch(function () {
					this.setSetting("error", true);
					MessageToast.show(this.getText("CreateErrorMessage"));
				}.bind(this));
		}.bind(this));
	};
	/**
	 * create project
	 * @method _createProject
	 * @private
	 * @instance	
	 * @param {boolean} btestMode test mode indicator
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._createProject = function (bTestMode) {
		return new Promise(function (resolve, reject) {
			this.setBusy(true);
			this.getModel("main").callFunction("/ProjectCreateFromDraft", {
				urlParameters: {
					NodeID: this.getSetting("projectId"),
					TestMode: bTestMode
				},
				success: function (oData) {
					this.setSetting("error", false);
					this.setBusy(false);
					resolve(oData.ProjectCreateFromDraft.ProjectId);
				}.bind(this),
				error: function () {
					this.setSetting("error", true);
					this.setBusy(false);
					reject();
				}.bind(this),
			});
		}.bind(this));
	};
	/**
	 * on review by FBP request
	 * @method onReviewByFbp
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onReviewByFbp = function () {
		this._triggerWfStep("FBPReview", false).then(function () {
			MessageToast.show(this.getText("FBPReviewRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * on review by PL request
	 * @method onReviewByPl
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onReviewByPl = function () {
		this._triggerWfStep("PLReview", false).then(function () {
			MessageToast.show(this.getText("PLReviewRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * on review by PM request
	 * @method onReviewByPm
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onReviewByPm = function () {
		this._triggerWfStep("PMReview", true).then(function () {
			MessageToast.show(this.getText("PMReviewRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * on create by fbp
	 * @method onCreateByFbp
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCreateByFbp = function () {
		this._triggerWfStep("FBPCreate", false).then(function () {
			MessageToast.show(this.getText("FBPCreateRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * on PSD Cancel
	 * @method onPSDCancel
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onPSDCancel = function () {
		this._triggerWfStep("PSDCancel", false, true).then(function () {
			MessageToast.show(this.getText("PSDCancelRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * undo PSD Cancel
	 * @method onPSDCancel
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onUndoPSDCancel = function () {
		this._triggerWfStep("UndoPSDCancel", false).then(function () {
			MessageToast.show(this.getText("UndoPSDCancelRequested"), {
				closeOnBrowserNavigation: false
			})
			this._leave();
		}.bind(this));
	};
	/**
	 * trigger a workflow Step
	 * @method _triggerWfStep
	 * @public
	 * @instance	
	 * @param {string} sStep the WF step name
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._triggerWfStep = function (sStep, bCheck, bSkipComment) {
		return new Promise(function (resolve, reject) {
			this._confirmAndComment(bSkipComment).then(function () {
					// first simulate project creation
					this._createProjectSimulate(bCheck)
						.then(function () {
							this.setBusy(true);
							var sProjectNodeData = this.getTreeModel().getProperty("/project/levels/0");
							var oProjectData = this.getModel("main").getObject(sProjectNodeData.Path);
							this.getModel("main").callFunction("/TriggerWfStep", {
								urlParameters: {
									NodeID: oProjectData.NodeID,
									Step: sStep,
									CurrentStatus: oProjectData.ProjectDefinition.Status,
									Comment: this.getSetting("wfComment")
								},
								success: function () {
									this.setSetting("error", false);
									this.setBusy(false);
									resolve();
								}.bind(this),
								error: function (oError) {
									MessageToast.show(this.getText("error"));
									this.setSetting("error", true);
									this.setBusy(false);
									reject(oError);
								}.bind(this),
							});
						}.bind(this))
						.catch(function (oError) {
							MessageToast.show(this.getText("error"));
							reject(oError);
						}.bind(this));
				}.bind(this))
				.catch(function () {
					MessageToast.show(this.getText("wfStepCanceled"));
					reject();
				}.bind(this));
		}.bind(this));
	};
	/**
	 * confirm And Comment wf step
	 * @method _confirmAndComment
	 * @public
	 * @instance	
	 * @return {promise} confirm promise
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._confirmAndComment = function (bSkipComment) {
		return new Promise(function (resolve, reject) {
			if (bSkipComment) {
				MessageBox.confirm(this.getText("wfStepConfirm"), {
					title: this.getText("wfStepConfirmTitle"),
					onClose: function (sDecision) {
						if (sDecision === 'OK') {
							resolve();
						} else {
							reject();
						}
					}.bind(this)
				});
			} else {
				this.getFragment(this._confirmFragment, "be.infrabel.psd.view.fragment.ConfirmAndComment")
					.then(function (oFragment) {
						this._confirmFragment = oFragment;
						oFragment.attachEventOnce("afterClose", function (oEvent) {
							if (oEvent.getParameter("origin").getId() === "ConfirmButtonId") {
								resolve();
							} else {
								reject();
							}
						}.bind(this));
						oFragment.open();
					}.bind(this))
					.catch(function (oError) {
						reject(oError);
					}.bind(this));
			}
		}.bind(this));
	};
	/**
	 * on Close Confirm And Comment dialog
	 * @method onCloseConfirmAndComment
	 * @private
	 * @instance
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCloseConfirmAndComment = function () {
		this._confirmFragment.close();
	};
	/**
	 * Project creation Simulation
	 * @method _createProjectSimulate
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._createProjectSimulate = function (bCheck) {
		return new Promise(function (resolve, reject) {
			sap.ui.getCore().getMessageManager().removeAllMessages();
			this._save()
				.then(function () {
					this._refreshTree().then(function () {
						if (!bCheck) {
							resolve();
							return;
						}
						this._createProject(true)
							.then(function () {
								resolve();
							}.bind(this))
							.catch(function (oError) {
								this.setSetting("error", true);
								reject(oError);
							}.bind(this));
					}.bind(this))
				}.bind(this))
				.catch(function (oError) {
					this.setSetting("error", true);
					reject(oError);
				}.bind(this));
		}.bind(this));
	};
	// /**
	//  * on back to draft
	//  * @method onBackToDraft
	//  * @public
	//  * @instance	
	//  * @memberof  be.infrabel.psd.controller.ProjectStructure
	//  * @author Christophe Taymans
	//  **/
	// oController.prototype.onBackToDraft = function () {
	// 	sap.ui.getCore().getMessageManager().removeAllMessages();
	// 	this._save()
	// 		.then(function () {
	// 			this._setProjectStatus("02").then(function () {
	// 				this.setSetting("approved", false);
	// 				this.setSetting("edit", false);
	// 				MessageToast.show(this.getText("BackToDraftSuccessMessage"), {
	// 					closeOnBrowserNavigation: false
	// 				})
	// 			}.bind(this));
	// 		}.bind(this))
	// 		.catch(function () {
	// 			this.setSetting("error", true);
	// 			MessageToast.show(this.getText("BackToDraftErrorMessage"));
	// 		}.bind(this));
	// };
	/**
	 * set Project Status
	 * @method _setProjectStatus
	 * @private
	 * @instance	
	 * @param {string} sStatus - the status
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._setProjectStatus = function (sStatus) {
		return new Promise(function (resolve, reject) {
			this.setBusy(true);
			this.getModel("main").callFunction("/ChangeProjectStatus", {
				urlParameters: {
					NodeID: this.getSetting("projectId"),
					Status: sStatus
				},
				success: function () {
					this.setSetting("error", false);
					this.setBusy(false);
					resolve();
				}.bind(this),
				error: function () {
					this.setSetting("error", true);
					this.setBusy(false);
					reject();
				}.bind(this),
			});
		}.bind(this));
	};
	/**
	 * on Display
	 * @method onDisplay
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onDisplay = function () {
		this.checkBeforeExit().then(function () {
			this.navTo("ProjectStructureRoute", {
				projectId: this.getSetting("projectId"),
				mode: "Display"
			});
		}.bind(this))
	};
	/**
	 * on read is successfull.
	 * @method onSuccessRead
	 * @public
	 * @instance	
	 * @param {object} oData the read data
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onSuccessRead = function (oData) {
		this.setBusy(false);
		var oTreeData = {
			"project": {
				levels: []
			}
		};
		oTreeData.project.levels.push(this._addNode(oData.results, oData.results[0]));
		this.getTreeModel().setProperty("/", oTreeData);
		var oItem = this.getSetting("oItem");
		if (oItem) {
			//renavigate to updated/created entry to refresh screen
			var oTree = oItem.getParent();
			var iItemIndex = oTree.indexOfItem(oItem);
			this._showItem(oTree.getItems()[iItemIndex]);
		}
		this._isChangeOccured();
		this.isTreeDataValid();
		var sProjectNodeData = this.getTreeModel().getProperty("/project/levels/0");
		var oProjectData = this.getModel("main").getObject(sProjectNodeData.Path);
		let oBarContainer;
		if (!oProjectData.Edit) {
			this.setSetting("edit", false);
		}
		// if (oProjectData.Locked) {
		// 	MessageToast.show(this.getText("Locked")), {
		// 		closeOnBrowserNavigation: false
		// 	};
		// }
		if (this.getSetting("headerToolbar")) {
			oBarContainer = this.byId("projectStructurePage").getHeader();
			oBarContainer.destroyContent();
		} else {
			oBarContainer = this.byId("projectStructurePage");
			oBarContainer.destroyFooter();
		}

		if (oProjectData.Toolbar) {
			//try {
			Fragment.load({
					name: "be.infrabel.psd.view.fragment.toolbar" + oProjectData.Toolbar,
					controller: this
				}).then(function (oToolbarFragment) {
					if (this.getSetting("headerToolbar")) {
						oBarContainer.addContent(oToolbarFragment);
					} else {
						oBarContainer.setFooter(oToolbarFragment);
					}
				}.bind(this))
				.catch(function (oError) {
					this.showError(oError);
				}.bind(this));
		}
		// switch (oProjectData.ProjectDefinition.Status) {
		// 	case "06":
		// 		this.setSetting("approved", true);
		// 		this.setSetting("edit", false);
		// 		break;
		// 	case "09":
		// 		this.setSetting("displayOnly", true);
		// 		this.setSetting("edit", false);
		// 		break;
		// 	default:
		// 		this.setSetting("approved", false);
		// 		this.setSetting("displayOnly", false);
		// 		break;
		// }
		var oInvestmentComponent = this.getSetting("oInvestmentComponent");
		if (oInvestmentComponent) {
			oInvestmentComponent.setEditMode(this.getSetting("edit"));
		}
		var oPartnerComponent = this.getSetting("oPartnerComponent");
		if (oPartnerComponent) {
			oPartnerComponent.setEditMode(this.getSetting("edit"));
		}
	};
	/**
	 * add a node
	 * @method _addNode
	 * @private
	 * @instance	
	 * @param {object} oData the whole read data
	 * @param {object} current the current node
	 * @param {string} hierarchyLevel the level to create
	 * @returns {object} the created node
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._addNode = function (oData, current, hierarchyLevel) {
		hierarchyLevel = hierarchyLevel || 0;
		var element = {
			Path: this.getModel("main").createKey((current.Type === "P" ? "/ProjectSet" : "/WbsSet"), {
				NodeID: current.NodeID,
				Type: current.Type
			}),
			HierarchyLevel: hierarchyLevel,
			Type: current.Type,
			ProjectId: current.ProjectId,
			Node: current.Node,
			NodeID: current.NodeID,
			ParentNodeID: current.ParentNodeID,
			DrillState: current.DrillState,
			Description: current.Description,
			CreatedBy: current.CreatedBy,
			CreatedOn: current.CreatedOn,
			ChangedBy: current.ChangedBy,
			ChangedOn: current.ChangedOn,
			levels: [],
			Error: false,
			local: false
		};
		hierarchyLevel++;
		oData.filter(function (row) {
			return row.ParentNodeID === current.NodeID
		}).forEach(function (row) {
			element.levels.push(this._addNode(oData, row, hierarchyLevel));
		}.bind(this));
		return element;
	};
	/**
	 * Event handler when a tree item gets pressed
	 * @method onitemPress
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans 
	 **/
	oController.prototype.onitemPress = function (oEvent) {
		// The source is the list item that got pressed
		var oItem = oEvent.getSource();
		this._showItem(oItem);
	};
	/**
	 * Event handler when the button Collpase get pressed
	 * @method onCollapse
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans 
	 **/
	oController.prototype.onCollapse = function () {
		var oTree = this.byId("projectstructureTreeId");
		oTree.collapseAll();
	};
	/**
	 * Event handler when the button Expand get pressed
	 * @method onExpand
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans 
	 **/
	oController.prototype.onExpand = function () {
		var oTree = this.byId("projectstructureTreeId");
		oTree.expandToLevel(3);
	};
	/**
	 * Shows the selected item on the object page
	 * @method _showItem
	 * @private
	 * @instance	
	 * @param {object} oItem selected item
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype._showItem = function (oItem) {
		var navigation;
		this.setSetting("oItem", oItem);
		if (!oItem) {
			return null;
		}
		oItem.setSelected(true);
		var oObject = oItem.getBindingContext("tree").getObject();
		if (!oObject) {
			return null;
		}
		switch (oObject.HierarchyLevel) {
			case 0: //Project Definition
				navigation = "ProjectDefinitionRoute";
				break;
			case 1: //WBS level 1
				navigation = "Wbs1Route";
				break;
			case 2: //WBS level 2
				navigation = "Wbs2Route";
				break;
			case 3: //WBS level 3
				navigation = "Wbs3Route";
				break;
		}
		this.navTo(navigation, {
			projectId: this.getSetting("projectId"),
			path: oObject.Path.slice(1),
			mode: this.getSetting("edit") ? "Edit" : "Display"
		}, true);
		return true;
	};
	/**
	 * on tree Update Finished
	 * @method onUpdateFinished
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onUpdateFinished = function (oEvent) {
		let oItem;
		if (!oEvent.getParameter("total")) {
			return;
		}
		if (this._originPath) {
			oItem = oEvent.getSource().getItems().filter(function (item) {
				return item.getBindingContext("tree").getObject().Path.slice(1) === this._originPath;
			}.bind(this))[0];
			this._originPath = undefined;

		} else if (!this.getSetting("oItem")) {
			oItem = oEvent.getSource().getItems()[0];
		}
		if (oItem) {
			this._showItem(oItem);
		}
	};
	/**
	 * on create WBS
	 * @method createWBS
	 * @public
	 * @instance	
	 * @param {integer} level level
	 * @returns {integer} next level
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.createWBS = function (level) {
		var element = {
			Path: undefined,
			Description: "",
			DrillState: "expanded",
			HierarchyLevel: level.HierarchyLevel + 1,
			Node: this.getNextWBSNumber(level),
			ParentNodeID: level.NodeID,
			ParentNode: level.Node,
			ProjectId: level.ProjectId,
			Type: 'W',
			wbs: {
				InvestmentProgram: undefined,
				InvestmentProgramYear: undefined,
				PositionID: undefined
			},
			toPartners: []
		};
		element.Path = this.getModel("main").createEntry("/WbsSet", {
			properties: element
		}).getPath();
		element.levels = [];
		element.local = true;
		level.levels.push(element);
		var index = level.levels.length - 1;
		if (element.HierarchyLevel < 3) {
			level.levels[index] = this.createWBS(level.levels[index]);
		}
		return level;
	};
	/**
	 * on create WBS
	 * @method onCreateWBS
	 * @public
	 * @instance	
	 * @returns {boolean} state
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCreateWBS = function () {
		var oTree = this.byId("projectstructureTreeId");
		var oItem = oTree.getSelectedItem();
		var oContext = oItem.getBindingContext("tree");
		var oObject = oContext ? oContext.getObject() : null;
		if (!oObject) {
			return null;
		}
		switch (oObject.HierarchyLevel) {
			case 3: //WBS level 3 is not a valid element to create subelements
				MessageToast.show(this.getText("wrongLevel"));
				break;
			default:
				//level = this.createWBS(level);
				this.createWBS(this.getTreeModel().getProperty(oItem.getBindingContextPath()));
				break;
		}
		oTree.getModel("tree").refresh();
		this._isChangeOccured();
		this.isTreeDataValid();
		return true;
	};
	/**
	 * get next wbs free enumber
	 * @method getNextWBSNumber
	 * @public
	 * @instance	
	 * @param {object} level level
	 * @returns {object} - next level
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans 
	 **/
	oController.prototype.getNextWBSNumber = function (level) {
		var nodes = [];
		var iLength = level.levels.length;
		var next;
		if (iLength === 0) {
			next = "01";
		} else {
			for (var i = 0; i < iLength; i++) {
				var splitted = level.levels[i].Node.split(/\.(?=[^\.]+$)/);
				splitted[1] = Number(splitted[1].replace(/\D/g, ""));
				nodes.push(splitted[1]);
			}
			nodes.sort();
			next = nodes[nodes.length - 1] + 1;
			next = next.toString(10).padStart(2, "0");
		}
		switch ((level.HierarchyLevel + 1)) {
			case 3:
				return level.Node + ".M" + next;
			default:
				return level.Node + "." + next;
		}
	};
	/**
	 * delete selected node
	 * @method onDeleteNode
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onDeleteNode = function () {
		var fResetChanges = function (oNode) {
			this.getModel("main").resetChanges([oNode.Path]);
			oNode.levels.forEach(fResetChanges, this);
		}.bind(this);
		MessageBox.show(this.getText("ConfirmToDelete"), {
			icon: sap.m.MessageBox.Icon.QUESTION,
			actions: [MessageBox.Action.YES, MessageBox.Action.NO],
			onClose: function (sReply) {
				if (sReply === MessageBox.Action.YES) {
					var subIndex = undefined;
					var oTree = this.byId("projectstructureTreeId");
					var oItem = this.getSetting("oItem");
					var previousNodeIndex = oItem.getParent().indexOfItem(oItem) - 1;
					var oNodeToDelete = oItem.getBindingContext("tree").getObject();
					// get the levels content of the parent node of the selected node to delete
					var sNodeToDeletePath = oItem.getBindingContextPath();
					var sPath = sNodeToDeletePath.substr(0, sNodeToDeletePath.lastIndexOf("/"));
					var aUpperNodeLevels = this.getTreeModel().getProperty(sPath);
					// detemrine the index of the node to delete in the levels arrays of the parent node
					aUpperNodeLevels.some(function (row, index) {
						if (row.Path === oNodeToDelete.Path) {
							subIndex = index;
							return true;
						}
					});
					if (!oNodeToDelete.local) {
						//node exist already in the backend
						this.setBusy(true);
						sap.ui.getCore().getMessageManager().removeAllMessages();
						this.getModel("main").remove(oNodeToDelete.Path, {
							success: function (oEvent) {
								this.setBusy(false);
								MessageToast.show(this.getText("DeletionSuccessMessage"), {
									closeOnBrowserNavigation: false
								});
								if (oNodeToDelete.Type === "P") {
									this.setSetting("projectId", undefined);
									this.navTo("worklistRoute");
									return;
								}
								//remove node in the tree structure
								aUpperNodeLevels.splice(subIndex, 1);
								oTree.getModel("tree").updateBindings(true);
								this._isChangeOccured();
								this.isTreeDataValid();
								// selet the direct up neighbours of the deleted node
								if (previousNodeIndex >= 0) {
									oTree.setSelectedItem(oTree.getItems()[previousNodeIndex]);
									oItem = oTree.getSelectedItem();
									this._showItem(oItem);
								}

							}.bind(this),
							error: function (oError) {
								this.setBusy(false);
								if (this.getModel("message").getData().some(function (row) {
										return row.type === "Error";
									})) {
									this.setSetting("error", true);
									MessageToast.show(this.getText("DeletionErrorMessage"));
								} else {
									this.showError(oError);
								}
							}.bind(this),
							groupId: "Delete"
						});
					} else {
						// node is not yet in the backend
						fResetChanges(oNodeToDelete);
						aUpperNodeLevels.splice(subIndex, 1);
						oTree.getModel("tree").updateBindings(true);
						this._isChangeOccured();
						this.isTreeDataValid();
						if (previousNodeIndex >= 0) {
							oTree.setSelectedItem(oTree.getItems()[previousNodeIndex]);
							oItem = oTree.getSelectedItem();
							this._showItem(oItem);
						}
					}
				}
			}.bind(this)
		});
	};
	/**
	 *  select a node
	 * @method onSelectLevel
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans 
	 **/
	oController.prototype.onSelectLevel = function () {
		var oTree = this.byId("projectstructureTreeId");
		var oItem = oTree.getSelectedItem();
		this._showItem(oItem);
	};
	/**
	 * on project check
	 * @method onProjectCheck
	 * @public
	 * @instance
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onProjectCheck = function () {
		this._createProjectSimulate()
			.then(function () {
				MessageToast.show(this.getText("CheckSuccessMessage"));
			}.bind(this))
			.catch(function (oError) {
				MessageToast.show(this.getText("CheckErrorMessage"));
			}.bind(this));
	};
	/**
	 * Event handler when PCD button item gets pressed
	 * @method onPCDPress
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.ProjectStructure
	 * @author  Christophe Taymans
	 */
	oController.prototype.onPCDPress = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		this.crossNavigate("PCD", "manage", {
			"projectID": this.getSetting("projectId")
		});
	};
	/**
	 * Event handler when PCD button item gets pressed
	 * @method onPCDPress
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.ProjectStructure
	 * @author  Christophe Taymans
	 */
	oController.prototype.onListPress = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		this.navTo("worklistRoute");
	};
	/**
	 * on save tree
	 * @method onSave
	 * @public
	 * @instance
	 * @memberof  be.infrabel.psd.controller.ProjectStructure
	 * @author Christophe Taymans
	 **/
	oController.prototype.onSave = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		this._save()
			.then(function (bRefresh) {
				if (bRefresh) {
					this._refreshTree();
					this.setSetting("error", false);
					this.setSetting("newPartners", []);
					this.setSetting("newGeoLoc", []);
				} else {
					this.isTreeDataValid();
				};
				MessageToast.show(this.getText("SaveSuccessMessage"));
			}.bind(this))
			.catch(function (oError) {
				if (oError.bLog) {
					this.setSetting("error", true);
					MessageToast.show(this.getText("SaveErrorMessage"));
				} else {
					this.showError(oError.error);
				}
			}.bind(this));
	};
	/**
	 * save tree
	 * @method _save
	 * @private
	 * @instance	
	 * @returns {promise} promise
	 * @memberof be.infrabel.psd.controller.ProjectStructure
	 * @author  Christophe Taymans
	 **/
	oController.prototype._save = function () {
		return new Promise(function (resolve, reject) {
			var oMainModel = this.getModel("main");
			if (!oMainModel.hasPendingChanges()) {
				resolve(false);
				return;
			}
			this.setBusy(true);
			oMainModel.submitChanges({
				success: function (oEvent) {
					this.setBusy(false);
					this.translateMessageTarget();
					if (this.getModel("message").getData().some(function (row) {
							return row.type === "Error";
						})) {
						reject({
							bLog: true
						});
					} else {
						resolve(true);
					}
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
					reject({
						bLog: false,
						error: oError
					});
				}.bind(this)
			});
		}.bind(this));
	};
	/**
	 * leave psd cockpit
	 * @method _leave
	 * @private
	 * @instance
	 * @memberof be.infrabel.psd.controller.ProjectStructure
	 * @author  Christophe Taymans
	 **/
	oController.prototype._leave = function () {
		if (this.getSetting("inboxCalled")) {
			if (this.getOwnerComponent().getComponentData()["onTaskUpdate"]) {
				this.getOwnerComponent().getComponentData().onTaskUpdate();
			}
			this.onNavBack();
		} else {
			this.setSetting("profileLoaded", false); //force a complete refresh of the list
			this.navTo("worklistRoute");
		}
	};

	return oController;
});
