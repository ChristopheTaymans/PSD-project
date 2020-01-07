sap.ui.define([
	"be/infrabel/psd/controller/WbsBaseController",
	"sap/m/MessageToast"
], function (WbsBaseController, MessageToast) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.Wbs3
	 * @name        be.infrabel.psd.controllers.Wbs3
	 * @class       be.infrabel.psd.controllers.Wbs3
	 * oController 
	 */
	var oController = WbsBaseController.extend("be.infrabel.psd.controller.Wbs3"); /**@lends be.infrabel.psd.controllers.Wbs3.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Wbs3
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		// call the base component's init function
		//WbsBaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("Wbs3Route").attachPatternMatched(this._onObjectMatched, this);
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @redefine 
	 * @memberof be.infrabel.psd.controllers.Wbs3
	 * @author Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function () {
		// call the base component's init function
		WbsBaseController.prototype._onObjectMatched.apply(this, arguments);
		var oModel = this.getModel("main");
		if (!this.getViewBindingContext()) {
			return;
		}
		this.getPartnerComponent().then(function (oComponent) {
			var aPartners = [];
			oComponent.setPartners(aPartners);
			oComponent.setEditMode(this.getSetting("edit"));
			if (this.getBindObject().NodeID) {
				this.setBusy(true);
				oModel.read(this.getViewBindingContext().getPath() + "/toPartners", {
					success: function (oData) {
						this.setBusy(false);
						aPartners = oData.results.map(function (row) {
							return {
								PartnerId: row.Parnr,
								PartnerLongName: row.NameList,
								PartnerFct: row.Parvw,
								PartnerFctName: row.ParvwText,
								Telephone: row.TelNumber,
								City: row.City,
								Street: row.Street,
								PostCode: row.PostCode
							}
						});
						this._addNewPartners(oComponent, aPartners);
					}.bind(this),
					error: function (oError) {
						this.setBusy(false);
						this.showError(oError, true);
					}.bind(this)
				});
			} else {
				this._addNewPartners(oComponent);
			}
		}.bind(this));
		this.getGeoLocComponent().then(function (oComponent) {
			var aGeoLoc = [];
			oComponent.setGeoLoc(aGeoLoc);

			var oTreeContext = this.getSetting("oItem").getBindingContext("tree");
			//get the upper wbs1 data and set location in component for the floc filtering
			var sTreePath = oTreeContext.getPath();
			var sUpperWbs2Path = sTreePath.substr(0, sTreePath.lastIndexOf("/levels/"));
			var sUpperWbs1Path = sUpperWbs2Path.substr(0, sUpperWbs2Path.lastIndexOf("/levels/"));
			var sUpperWbs1Node = this.getTreeModel().getProperty(sUpperWbs1Path);
			var sLocation = this.getModel("main").getProperty(sUpperWbs1Node.Path).wbs.Location;            
			oComponent.setGeoLocation(sLocation);
			oComponent.setEditMode(this.getSetting("edit"));
			if (this.getBindObject().NodeID) {
				this.setBusy(true);
				oModel.read(this.getViewBindingContext().getPath() + "/ToGeoData", {
					success: function (oData) {
						this.setBusy(false);
						aGeoLoc = oData.results.map(function (row) {
							return {
								Levl: row.Levl,
								Key: row.Key,
								Description: row.Description,
								MarkerStart: row.MarkerStart,
								MarkerDistSta: row.MarkerDistSta,
								MarkerEnd: row.MarkerEnd,
								MarkerDistEnd: row.MarkerDistEnd,
								StartPoint: row.StartPoint,
								EndPoint: row.EndPoint,
								LinearUnit: row.LinearUnit
							}
						});
						this._addNewGeoLoc(oComponent, aGeoLoc);
					}.bind(this),
					error: function (oError) {
						this.setBusy(false);
						this.showError(oError, true);
					}.bind(this)
				});
			} else {
				this._addNewGeoLoc(oComponent);
			}
		}.bind(this));
	};
	/**
	 *add newly created partners to selected WBS3 
	 * @method _addNewPartners
	 * @private
	 * @instance	
	 * @param {component} oPartnerComponent the partner component
	 * @param {array} aExistingPartners the already defined partner list 
	 * @memberof be.infrabel.psd.controllers.Wbs3
	 * @author Christophe Taymans
	 **/
	oController.prototype._addNewPartners = function (oPartnerComponent, aExistingPartners) {
		const newPartners =
			this.getSetting("newPartners").filter(function (row) {
				return row.oWbsContext === this.getViewBindingContext();
			}.bind(this))
			.map(function (row) {
				const oData = this.getModel("main").getObject(row.oNewEntryContext.getPath());
				return {
					PartnerId: oData.Parnr,
					PartnerLongName: oData.NameList,
					PartnerFct: oData.Parvw,
					PartnerFctName: oData.ParvwText,
					Telephone: oData.TelNumber,
					City: oData.City,
					Street: oData.Street,
					PostCode: oData.PostCode
				};
			}.bind(this));
		oPartnerComponent.setPartners((aExistingPartners ? aExistingPartners : []).concat(newPartners));
	};
	/**
	 *add geoloc to selected WBS3 
	 * @method ._addNewGeoLoc
	 * @private
	 * @instance	
	 * @param {component} oGeoLocComponent the geoloc component
	 * @param {array} oExistingGeoloc the already defined geoloc object
	 * @memberof be.infrabel.psd.controllers.Wbs3
	 * @author Christophe Taymans
	 **/
	oController.prototype._addNewGeoLoc = function (oGeoLocComponent, oExistingGeoloc) {
		const newGeoLocs = this.getSetting("newGeoLoc").filter(function (row) {
				return row.oWbsContext === this.getViewBindingContext();
			}.bind(this))
			.map(function (row) {
				let oData = this.getModel("main").getObject(row.oNewEntryContext.getPath());
				return {
					Levl: oData.Levl,
					Key: oData.Key,
					Description: oData.Description,
					MarkerStart: oData.MarkerStart,
					MarkerDistSta: oData.MarkerDistSta,
					MarkerEnd: oData.MarkerEnd,
					MarkerDistEnd: oData.MarkerDistEnd,
					StartPoint: oData.StartPoint,
					EndPoint: oData.EndPoint,
					LinearUnit: oData.LinearUnit
				}
			}.bind(this));

		oGeoLocComponent.setGeoLoc((oExistingGeoloc ? oExistingGeoloc : []).concat(newGeoLocs));
	};
	/**
	 * called when investment reason change
	 * @method _onInvestementReasonChange
	 * @private
	 * @instance
	 * @memberof be.infrabel.psd.controllers.Wbs3
	 * @author  christophe Taymans
	 **/
	oController.prototype._onInvestementReasonChange = function (oEvent) {
		// call the base component's init function
		//this.ValueHelpTool.handleEvent(oEvent);
		var oData = this.getBindObject();
		var iOffsetSuffix = oData.Node.lastIndexOf(".") + 1;
		if (!oData.wbs.InvestmentReason || oData.Node.slice(iOffsetSuffix, iOffsetSuffix + 2) === oData.wbs.InvestmentReason) {
			// investment reason is undefined or investment reason has not changed Vs. previous value
			return;
		}
		var oTreeContext = this.getSetting("oItem").getBindingContext("tree");
		//get tree path of current selected node
		var sTreePath = oTreeContext.getPath();
		// get tree path od the upper levels
		var sUpperNodeLevelsPath = sTreePath.substr(0, sTreePath.lastIndexOf("/"));
		// get upper levels content
		var aUpperNodeLevels = this.getTreeModel().getProperty(sUpperNodeLevelsPath).filter(function (row) {
			return row.Node.slice(iOffsetSuffix, iOffsetSuffix + 2) === oData.wbs.InvestmentReason;
		}.bind(this));
		//enumerate all used number for the suffix of the WBS
		var aExistingNumbers = aUpperNodeLevels.map(function (row) {
			return row.Node.slice(iOffsetSuffix + 2);
		}).sort();
		// search the first free number for the WBS3 suffix
		for (var i = 0; i < 9; i++) {
			var aValue = aExistingNumbers[i];
			if (aValue != i + 1) {
				var nextFreeNumber = i + 1;
				break;
			}
		};
		if (!nextFreeNumber) {
			// no free number for this suffix -> error			
			MessageToast.show(this.getText("wbs3MaximumNumber"));
			this.getModel("main").setProperty("wbs/InvestmentReason", undefined);
			return;
		};
		// build the WBS element name with the new suffix = investment reason + free number
		oData.Node = oData.Node.slice(0, iOffsetSuffix) + oData.wbs.InvestmentReason + nextFreeNumber;
		oData.NodeID = undefined;
		// update tree with new WBS name
		this.getTreeModel().setProperty("Node", oData.Node, oTreeContext);
		this.getTreeModel().setProperty("NodeID", oData.NodeID, oTreeContext);
		var oModel = this.getModel("main");
		// if current wbs is local , update the Node in the main model
		if (oTreeContext.getObject().local) {
			oModel.setProperty("Node", oData.Node, this.getViewBindingContext());
		} else {
			// if current wbs is not local , it means that we have to delete cuurent one and create 
			// a new with the existing data and the new name			
			// new wbs creation
			var oNewEntryContext = oModel.createEntry("/WbsSet", {
				properties: oData
			});
			// make a delete request for the current WBS
			var oldWbsPath = this.getTreeModel().getProperty("Path", oTreeContext);
			oModel.remove(oldWbsPath, {
				groupId: "changes"
			});
			// update tree with the path of the new entry and the local flag
			this.getTreeModel().setProperty("Path", oNewEntryContext.getPath(), oTreeContext);
			this.getTreeModel().setProperty("local", true, oTreeContext);
			// navigate to the new entry
			this.navTo("Wbs3Route", {
				projectId: this.getSetting("projectId"),
				path: oNewEntryContext.getPath().slice(1),
				mode: this.getSetting("edit")
			}, true);
		}
	};
	/**
	 * called at partner component creation
	 * @method getPartnerComponent
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.Wbs3
	 * @author Christophe Taymans
	 **/
	oController.prototype.getPartnerComponent = function () {
		return new Promise(function (resolve, reject) {
			const oPartnerComponent = this.getSetting("oPartnerComponent");
			if (oPartnerComponent) {
				resolve(oPartnerComponent);
			} else {
				this.getOwnerComponent().createComponent("relatedPartner")
					.then(function (oComponent) {
						this.setSetting("oPartnerComponent", oComponent);
						this.byId("partnerContainer").setComponent(oComponent);
						oComponent.attachPartnerAdded({}, function (oEvent) {
							const oNewPartner = oEvent.getParameter("newPartner");
							const oModel = this.getModel("main");
							const oData = this.getBindObject();
							const oPartner = {
								NodeID: oData.NodeID,
								Node: oData.Node,
								Type: 'W',
								Parvw: oNewPartner.PartnerFct,
								Parnr: oNewPartner.PartnerId,
								NameList: oNewPartner.PartnerLongName,
								ParvwText: oNewPartner.PartnerFctName,
								City: oNewPartner.City,
								Street: oNewPartner.Street,
								PostCode: oNewPartner.PostCode
							}
							const newPartners = this.getSetting("newPartners");
							newPartners.push({
								oWbsContext: this.getViewBindingContext(),
								oNewEntryContext: oModel.createEntry("/PartnerSet", {
									properties: oPartner
								})
							});
							this.setSetting("newPartners", newPartners);
							this._isChangeOccured();
						}, this);
						oComponent.attachPartnerDeleted({}, function (oEvent) {
							const oDeletedPartner = oEvent.getParameter("deletedPartner");
							const oModel = this.getModel("main");
							const oData = this.getBindObject();
							let newPartner;
							this.getSetting("newPartners").some(function (row) {
								const currentPartner = this.getModel("main").getObject(row.oNewEntryContext.getPath());
								if (row.oWbsContext === this.getViewBindingContext() && oDeletedPartner.PartnerId === currentPartner.Parnr && oDeletedPartner.PartnerFct === currentPartner.Parvw) {
									oModel.deleteCreatedEntry(row.oNewEntryContext);
									newPartner = row;
									return true;
								} else {
									return false;
								}
							}.bind(this));
							if (newPartner) {
								this.setSetting("newPartners",
									this.getSetting("newPartners").filter(
										function (row) {
											return row != newPartner
										})
								)
							} else {
								const sPath = oModel.createKey("/PartnerSet", {
									NodeID: oData.NodeID,
									Type: 'W',
									Parvw: oDeletedPartner.PartnerFct,
									Parnr: oDeletedPartner.PartnerId
								});
								this.setBusy(true);
								oModel.remove(sPath, {
									success: function () {
										this.setBusy(false);
									}.bind(this),
									error: function () {
										this.setBusy(false);
									}.bind(this)
								});
							}
							this._isChangeOccured();
						}, this);
						resolve(oComponent);
					}.bind(this))
					.catch(function (oError) {
						reject(oError);
					});
			}
		}.bind(this));
	};
	/**
	 * called at geo location component creation
	 * @method getGeoLocComponent
	 * @public
	 * @instance	
	 * @memberof  be.infrabel.psd.controller.Wbs3
	 * @author Christophe Taymans
	 **/
	oController.prototype.getGeoLocComponent = function () {
		return new Promise(function (resolve, reject) {
			const oPartnerComponent = this.getSetting("oGeoLocComponent");
			if (oPartnerComponent) {
				resolve(oPartnerComponent);
			} else {
				this.getOwnerComponent().createComponent("geoLocalisation")
					.then(function (oComponent) {
						this.setSetting("oGeoLocComponent", oComponent);
						this.byId("geoLocContainer").setComponent(oComponent);
						oComponent.attachGeoDataAdded({}, function (oEvent) {
							const oNewGeoLoc = oEvent.getParameter("newGeoLocalisation");
							const oModel = this.getModel("main");
							const oData = this.getBindObject();
							const oGeoLoc = {
								NodeID: oData.NodeID,
								Node: oData.Node,
								Type: 'W',
								Levl: oNewGeoLoc.Levl,
								Key: oNewGeoLoc.Key,
								MarkerStart: oNewGeoLoc.MarkerStart,
								MarkerDistSta: oNewGeoLoc.MarkerDistSta.toString(),
								MarkerEnd: oNewGeoLoc.MarkerEnd,
								MarkerDistEnd: oNewGeoLoc.MarkerDistEnd.toString(),
								StartPoint: oNewGeoLoc.StartPoint,
								EndPoint: oNewGeoLoc.EndPoint,
								Description: oNewGeoLoc.Description,
								LinearUnit: oNewGeoLoc.LinearUnit
							}
							const newGeoLoc = this.getSetting("newGeoLoc");
							newGeoLoc.push({
								oWbsContext: this.getViewBindingContext(),
								oNewEntryContext: oModel.createEntry("/GeoDataSet", {
									properties: oGeoLoc
								})
							});
							this.setSetting("newGeoLoc", newGeoLoc);
							this._isChangeOccured();
						}, this);
						oComponent.attachGeoDataDeleted({}, function (oEvent) {
							const oDeletedGeoLoc = oEvent.getParameter("deletedGeoLocalisation");
							const oModel = this.getModel("main");
							const oData = this.getBindObject();
							let newGeoLoc;
							this.getSetting("newGeoLoc").some(function (row) {
								const currentGeoLoc = this.getModel("main").getObject(row.oNewEntryContext.getPath());
								if (row.oWbsContext === this.getViewBindingContext() &&
									oDeletedGeoLoc.Levl === currentGeoLoc.Levl &&
									oDeletedGeoLoc.Key === currentGeoLoc.Key &&
									oDeletedGeoLoc.MarkerStart === currentGeoLoc.MarkerStart &&
									oDeletedGeoLoc.MarkerDistSta === currentGeoLoc.MarkerDistSta &&
									oDeletedGeoLoc.MarkerEnd === currentGeoLoc.MarkerEnd &&
									oDeletedGeoLoc.MarkerDistEnd === currentGeoLoc.MarkerDistEnd) {
									oModel.deleteCreatedEntry(row.oNewEntryContext);
									newGeoLoc = row;
									return true;
								} else {
									return false;
								}
							}.bind(this));
							if (newGeoLoc) {
								this.setSetting("newGeoLoc",
									this.getSetting("newGeoLoc").filter(
										function (row) {
											return row != newGeoLoc
										})
								)
							} else {
								const sPath = oModel.createKey("/GeoDataSet", {
									NodeID: oData.NodeID,
									Type: 'W',
									Levl : oDeletedGeoLoc.Levl,
									Key : oDeletedGeoLoc.Key,
									MarkerStart : oDeletedGeoLoc.MarkerStart,
									MarkerDistSta : oDeletedGeoLoc.MarkerDistSta,
									MarkerEnd : oDeletedGeoLoc.MarkerEnd,
									MarkerDistEnd : oDeletedGeoLoc.MarkerDistEnd
								});
								this.setBusy(true);
								oModel.remove(sPath, {
									success: function () {
										this.setBusy(false);
									}.bind(this),
									error: function () {
										this.setBusy(false);
									}.bind(this)
								});
							}
							this._isChangeOccured();
						}, this);
						resolve(oComponent);
					}.bind(this))
					.catch(function (oError) {
						reject(oError);
					});
			}
		}.bind(this));
	};
	return oController;
});
