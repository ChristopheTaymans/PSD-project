sap.ui.define([
	"be/infrabel/psd/controller/BaseController",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/m/IconTabFilter",
	"sap/m/Button",
	"sap/m/Menu",
	"sap/m/MenuButton",
	"sap/m/MenuItem"
], function (BaseController, FilterOperator, Filter, IconTabFilter, Button, Menu, MenuButton, MenuItem) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     be.infrabel.psd.controllers.BaseController
	 * @name        be.infrabel.psd.controllers.Worklist
	 * @class       be.infrabel.psd.controllers.Worklist
	 * oController 
	 */
	var oController = BaseController.extend("be.infrabel.psd.controller.Worklist"); /**@lends be.infrabel.psd.controllers.Worklist.prototype **/
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
		this.addHistoryEntry({
			title: this.getResourceBundle().getText("worklistViewTitle"),
			icon: "sap-icon://table-view",
			intent: "#PSD-display"
		}, true);
		this.getRouter().getRoute("worklistRoute").attachPatternMatched(this._onObjectMatched, this);
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
	 * @memberof  be.infrabel.psd.controller.Worklist
	 * @author Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function (oEvent) {

		// if (this.getSetting("projectId")) {
		// 	// refresh newly created IP after creation
		// 	this.getModel("main").read(this.getModel("main").createKey("/ProjectListSet", {
		// 		ProfileId: this.getSetting("profileId"),
		// 		ProjectId: this.getSetting("projectId")
		// 	}));
		// }
		this.initialize();
		this.loadProfile().then(function (sProfilePath) {
			if (sProfilePath) {
				this.getView().bindElement({
					path: sProfilePath,
					model: "main",
					events: {
						change: function () {
							this._loadList();
						}.bind(this)
					}
				});
				const aFilter = this.getSetting("worklistFilter");
				if (aFilter.length) {
					const oFiltertabbar = this.byId("filterTabbar");
					// add all filter to the toolbar
					oFiltertabbar.destroyItems();
					aFilter.forEach(function (oFilter) {
						oFiltertabbar.addItem(new IconTabFilter({
							key: oFilter.FilterId,
							text: oFilter.FilterDescription,
							count: oFilter.Count
						}));
					}.bind(this));
				};
				const aAction = this.getSetting("worklistAction");
				if (aAction.length) {
					const aGroup = aAction.reduce(function (array, row) {
						if (!array.length || !array.some(function (existing) {
								return existing.GroupId === row.GroupId;
							}))
							array.push({
								GroupId: row.GroupId,
								GroupDescription: row.GroupDescription
							}); {
							return array;
						}
					}, []);
					const oActionToolbar = this.byId("actionMenu");
					oActionToolbar.destroyActions();
					//add button not in a group
					aAction.forEach(function (oAction) {
						if (oAction.GroupId === "") {
							let oButton = new Button({
								text: oAction.Description,
								type: ( oAction.SemanticAction !="" ) ? "Emphasized" : "Default",
								enabled: (oAction.SemanticAction !="") ,
								press: this.triggerAction.bind(this)
							});
							oButton.data("semanticObject", oAction.SemanticObject);
							oButton.data("semanticAction", oAction.SemanticAction);
							oActionToolbar.addAction(oButton);
						}
					}.bind(this));
					// for each group
					aGroup.forEach(function (oGroup) {
						if (oGroup.GroupId != "") {
							// get action from the group
							let aGroupAction = aAction.filter(function (row) {
								return row.GroupId === oGroup.GroupId;
							});
							if (aGroupAction.length) {
								// create the Menu for the group
								let oMenu = new Menu();
								// and add action in the group
								aGroupAction.forEach(function (oAction) {
									let oButton = new MenuItem({
										text: oAction.Description,
										enabled: (oAction.SemanticAction !="") ,										
										press: this.triggerAction.bind(this)
									});
									oButton.data("semanticObject", oAction.SemanticObject);
									oButton.data("semanticAction", oAction.SemanticAction);
									oMenu.addItem(oButton);
								}.bind(this));
								//add the group enu in the toolbar
								oActionToolbar.addAction(new MenuButton({
									text: oGroup.GroupDescription
								}).setMenu(oMenu));
							}
						}
					}.bind(this));
				}
			} else {
				this._loadList();
			}
		}.bind(this));

	};
	/**
	 * load the list
	 * @method _loadList
	 * @private
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'* 
	 * @memberof  be.infrabel.psd.controller.Worklist
	 * @author Christophe Taymans
	 **/
	oController.prototype._loadList = function () {
		if (this.getSetting("worklistFilterKey")) {
			// filter exist		
			this.byId("table").getBinding("items").filter([new Filter("Filter", "EQ", this.getSetting("worklistFilterKey"))], "Control");
		} else {
			// no filter -> only refresh the list
			this.byId("table").getBinding("items").refresh();
		}
	};
	/**
	 * Event handler when PSD button item gets pressed
	 * @method onPSDPress
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.onPSDPress = function (oEvent) {
		// The source is the list item that got pressed
		const oSelectedItem = oEvent.getSource().getParent();
		oSelectedItem.setSelected(true);
		this.setSetting("oItem", null);
		this.navTo("ProjectStructureRoute", {
			projectId: oSelectedItem.getBindingContext("main").getProperty("ProjectId"),
			mode: oSelectedItem.getBindingContext("main").getProperty("Status") === '09' ? 'DisplayOnly' : 'Display'
		});
	};
	/**
	 * Event handler when PCD button item gets pressed
	 * @method onPCDPress
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.onPCDPress = function (oEvent) {
		const oSelectedItem = oEvent.getSource().getParent();
		this.crossNavigate("PCD","manage",{
			"projectID": oSelectedItem.getBindingContext("main").getProperty("ProjectId")
		});
	};
	/**
	 * Event handler when onSearch button pressed
	 * @method onSearch
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.onSearch = function (oEvent) {
		const oTableBinding = this.byId("table").getBinding("items");
		const sQuery = oEvent.getParameter("query");
		if (oEvent.getParameters().clearButtonPressed || !sQuery) {
			oTableBinding.filter([], "Application");
		} else {

			if (sQuery && sQuery.length) {
				oTableBinding.filter([new Filter("Search", FilterOperator.Contains, sQuery)], "Application");
			}
		}
	};
	/**
	 * Event handler for selecting another tab in the IconTabbar.
	 * Another set of data will be selected
	 * @method onSelectIconTabBar
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.onSelectIconTabBar = function (oEvent) {
		this.setSetting("worklistFilterKey", oEvent.getParameter("key"));
		this._loadList();
	};
	/**
	 * Event handler for create document event. This wil start the screen for creating 
	 * a new project defintion
	 * @method onCreateDocument
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.onCreateDocument = function (oEvent) {
		this.setSetting("actions/create", false);
		this.navTo("CreateProjectDefinitionRoute");
	};
	/**
	 * on Trigger Action
	 * @method triggerAction
	 * @public
	 * @instance
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.triggerAction = function (oEvent) {
		const oSource = oEvent.getSource();
		const sSematicObject = oSource.data("semanticObject");
		const sSematicAction = oSource.data("semanticAction");
		const xnavservice = sSematicObject && sSematicAction && sap.ushell && sap.ushell.Container && sap.ushell.Container.getService &&
			sap.ushell.Container.getService("CrossApplicationNavigation");
		var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: sSematicObject,
				action: sSematicAction
			}
		})) || "";
		(href && xnavservice && xnavservice.toExternal({
			target: {
				shellHash: href
			}
		}));
	};
	/**
	 * formatter for button type
	 * @method getPsdButtonType
	 * @public
	 * @param {string} sStatus the project status
	 * @returns {sap.m.ButtonType} the button type
	 * @memberof be.infrabel.psd.controllers.Worklist
	 * @author  Christophe Taymans
	 */
	oController.prototype.getPsdButtonType = function (sStatus) {
		switch (sStatus) {
			case '09':
				return sap.m.ButtonType.Reject;
			default:
				return sap.m.ButtonType.Accept;
		}
	};
	return oController;
});
