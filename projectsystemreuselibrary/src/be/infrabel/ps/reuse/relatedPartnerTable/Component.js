sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/m/CustomListItem",
		"sap/m/Text",
		"sap/base/util/merge",
		"sap/m/MessageToast"
	],
	function (UIComponent, JSONModel, Device, Filter, FilterOperator, Fragment, CustomListItem, Text, Merge, MessageToast) {
		"use strict";

		/**
		 * Constructor for the Related Partners Table Reusable Component.
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 * This reusable component displays a <code>sap.m.Table</code> with information about given partners 
		 *
		 * <h3>Usage</h3>
		 *
		 * The application developer using this component must provide following data in the manifest.json of his application:
		 * <li>	* 
		 * 	<ul>
		 * 		partnerTypeInfo: An object to include/exclude specific partner types (partner functions) from the table.
		 * 	</ul>
		 * </li>
		 *
		 * In the component then everything is generic by using these parameters. *
		 *
		 *
		 * @name    	be.infrabel.ps.reuse.relatedPartnerTable
		 * @alias   	be.infrabel.ps.reuse.relatedPartnerTable
		 * @author  	Christophe Taymans
		 * @license 	Infrabel Private
		 * @extends 	sap.ui.core.UIComponent
		 * @constructor
		 * @public
		 */
		const Component = UIComponent.extend(
			"be.infrabel.ps.reuse.relatedPartnerTable.Component",
			/** @lends be.infrabel.ps.reuse.relatedPartnerTable.Component.prototype **/
			{
				metadata: {
					manifest: "json",
					properties: {
						/**
						 * Restrictions on the allowed or ignored partner types in the Component. This will be add default filtering on the items in the list or on the possibility to search on this specific types.
						 *
						 * @public
						 */
						partnerProfile: {
							type: "string",
							defaultValue: "I001"
						},
						partnerFunction: {
							type: "string",
							defaultValue: undefined
						}
					},
					aggregations: {},
					events: {
						/**
						 * Event raised when Partner is added 
						 *
						 * @public
						 */
						PartnerAdded: {
							parameters: {
								Partners: {
									type: "object"
								},
								newPartner: {
									type: "object"
								}
							}
						},
						/**
						 * Event raised when Partner is deleted
						 *
						 * @public
						 */
						PartnerDeleted: {
							parameters: {
								Partners: {
									type: "object"
								},

								deletedPartner: {
									type: "object"
								}
							}
						}
					}
				}
			}
		);

		//=============================================================================
		// LIFECYCLE APIS
		//=============================================================================

		/**
		 * Initialization of the component
		 *
		 * @method		init
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 * @override
		 */
		Component.prototype.init = function () {
			this.setModel(
				new JSONModel({
					tableTitle: this.getText("partner.table.title", [0]),
					partnerProfile: undefined,
					partnerFunction: undefined,
					uniquePartnerFunction: false,
					edit: false,
					oItem: undefined,
				}),
				"settings"
			);
			const componentData = this.getComponentData();
			if (componentData.partnerProfile) {
				this.setSetting("partnerProfile", componentData.partnerProfile);
			};
			if (componentData.partnerFunction) {
				this.setSetting("partnerFunction", componentData.partnerFunction);
			};
			// set partners model
			this.setModel(
				new JSONModel([{
					PartnerId: undefined,
					PartnerLongName: undefined,
					PartnerFct: undefined,
					PartnerFctName: undefined,
					Telephone: undefined,
					Email: undefined
				}]),
				"partners"
			);
			// Device Model
			const deviceModel = new JSONModel(Device);
			deviceModel.setDefaultBindingMode("OneWay");
			this.setModel(deviceModel, "device");
			const oModel = this.getModel("main");
			oModel.metadataLoaded().then(function () {
				let sPath, oFilter;
				const partnerProfile = this.getSetting("partnerProfile");
				const partnerFunction = this.getSetting("partnerFunction");

				if (partnerFunction && partnerProfile) {
					this.setSetting("uniquePartnerFunction", true);
					sPath = oModel.createKey("/PartnerFunctionSet", {
						Pargr: partnerProfile,
						Parvw: partnerFunction
					});
				} else if (partnerProfile) {
					sPath = "/PartnerFunctionSet";
					oFilter = [new Filter({
						path: 'Pargr',
						operator: FilterOperator.EQ,
						value1: this.getSetting("partnerProfile")
					})];
				}
				oModel.read(sPath, {
					filters: oFilter,
					success: function (oData) {
						this.setModel(new JSONModel(this.getSetting("uniquePartnerFunction") ? [oData] : oData.results), "partnerFunction");
					}.bind(this)
				});
			}.bind(this));
			UIComponent.prototype.init.apply(this, arguments);
		};
		/**
		 * Creates the root control, a <code>sap.m.Table</code> representing the Component.
		 *
		 * @method		createContent
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @returns		{sap.m.Table}				The entry point of the component (Table)
		 * @public
		 * @override
		 */
		Component.prototype.createContent = function () {
			const oVbox = new sap.m.VBox();
			this._getPartnerTable().then(function () {
				oVbox.addItem(this._partnersTable);
			}.bind(this));
			return oVbox;
		};
		/**
		 * Called when the component is destroyed
		 *
		 * @method		destroy
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 * @override
		 */
		Component.prototype.destroy = function () {
			if (this._partnersTable) {
				this._partnersTable.destroy();
			}
			UIComponent.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Called when user ask partner value help
		 * @method		onPartnerValueHelp
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{sap.ui.base.Event}	oEvent	calling event
		 * @public		
		 */
		Component.prototype.onPartnerValueHelp = function (oEvent) {
			const oCombo = oEvent.getSource();
			this.setSetting("oItem", oCombo.getParent());
			const oData = oCombo.getBindingContext("partners").getObject();
			const oTemplate = new CustomListItem({
				content: [
					new Text({
						text: "{main>PartnerId} {main>PartnerLongName}"
					})
				]
			});
			this._getAddPartnerDialog().then(function (oFragment) {
				oCombo.addDependent(oFragment);
				const sPath = "main>" + this.getModel("main").createKey("/PartnerFunctionSet", {
					Pargr: this.getSetting("partnerProfile"),
					Parvw: oData.PartnerFct
				}) + "/PartnerSet";
				this._addDialog.bindAggregation("items", {
					path: sPath,
					template: oTemplate,
					templateShareable: false
				});
				this.getModel("main").refresh();
				oInput.addDependent(oValueHelpDialog);
				this._addDialog.open();
			}.bind(this));
		};


		//=============================================================================
		// OVERRIDE SETTERS/GETTERS
		//=============================================================================

		/**
		 * Getter for i18n ressource
		 *
		 * @method		getText
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param {string} fTextId the text name in the bundle
		 * @param {string} fArgs arguments for the text
		 * @returns {string} the text
		 */
		Component.prototype.getText = function (fTextId, fArgs) {
			return this.getModel("i18n").getResourceBundle().getText(fTextId, fArgs);
		};

		/**
		 * Setter for the setting model property
		 *
		 * @method		setSetting
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{object}					partnerTypeInfo					PartnerTypeInfo object
		 * @returns		{be.infrabel.ps.reuse.relatedPartnerTable.Component}	Reference to the current component
		 * @public
		 */
		Component.prototype.setSetting = function (sProperty, sValue) {
			this.getModel("settings").setProperty("/" + sProperty, sValue);
		};
		/**
		 * Getter for the setting model property
		 *
		 * @method		getSetting
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{object}					partnerTypeInfo					PartnerTypeInfo object
		 * @returns		{be.infrabel.ps.reuse.relatedPartnerTable.Component}	Reference to the current component
		 * @public
		 */
		Component.prototype.getSetting = function (sProperty) {
			return this.getModel("settings").getProperty("/" + sProperty);
		};
		/**
		 * Setter for partners list
		 *
		 * @method		setPartners
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{boolean}					mode							edit Mode flag
		 * @returns		{be.infrabel.ps.reuse.relatedPartnerTable.Component}	Reference to the current component
		 * @public
		 */
		Component.prototype.setPartners = function (aPartners) {
			this.getModel("partners").setData(aPartners);
			this.getModel("partners").refresh(true);
			const oMainModel = this.getModel("main");
			aPartners.forEach(function (row) {
				const sPath = oMainModel.createKey("/PartnerSet", {
					Pargr: this.getSetting("partnerProfile"),
					PartnerId: row.PartnerId,
					PartnerFct: row.PartnerFct
				});
				oMainModel.read(sPath);
			}.bind(this));
			return this;
		};
		/**
		 * Setter for the mode property
		 *
		 * @method		setMode
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{boolean}					mode							edit Mode flag
		 * @returns		{be.infrabel.ps.reuse.relatedPartnerTable.Component}	Reference to the current component
		 * @public
		 */
		Component.prototype.setEditMode = function (bEdit) {
			this.setSetting("edit", bEdit);
			return this;
		};
		//=============================================================================
		// PUBLIC APIS
		//=============================================================================

		//=============================================================================
		// EVENT HANDLERS
		//=============================================================================

		/**
		 * Eventhandler called when the list-loading of the <code>sap.m.Table</code> is finished, at this
		 * point the total nr of items is displayed in the header of the table
		 *
		 * @method		onRelatedPartnersTableUpdateFinished
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{sap.ui.base.Event}				evt							The updateFinished-event
		 * @public
		 */
		Component.prototype.onRelatedPartnersTableUpdateFinished = function (evt) {
			let sTitle;
			if (this.getSetting("uniquePartnerFunction")) {
				sTitle = this.getText("partner.table.unique.title");
			} else {
				sTitle = this.getText("partner.table.title", [evt.getParameter("total")]);
			}
			this.getModel("settings").setProperty("/tableTitle", sTitle);
		};
		/**
		 * Eventhandler called when the user presses on the add-button. This will open the Add-Dialog.
		 *
		 * @method		onAddPartnerPress
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 */
		Component.prototype.onAddPartnerPress = function (oEvent) {
			const oButton = oEvent.getSource();
			this._getAddPartnerDialog().then(function (oFragment) {
				oButton.addDependent(oFragment);
				if (this.getSetting("uniquePartnerFunction")) {
					this._buildValueList(this.getSetting("partnerProfile"), this.getSetting("partnerFunction"));
				}
				this._addDialog.open();
			}.bind(this));
		};
		/**
		 * Partner function selected	 
		 *
		 * @method		onParnerFunctionSelected 
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{sap.ui.base.Event} oEvent	event 
		 * @public
		 */
		Component.prototype.onParnerFunctionSelected = function (oEvent) {
			const oSelected = oEvent.getParameter("selectedItem").getBindingContext("partnerFunction").getObject();
			this._buildValueList(oSelected.Pargr, oSelected.Parvw);
		};
		/**
		 * _buildValueList  
		 *
		 * @method		_buildValueList 
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{string} partnerProfile	partner Profile
		 * @param		{string} partnerFunction partner Function 
		 * @public
		 */
		Component.prototype._buildValueList = function (partnerProfile, partnerFunction) {
			const sPath = "main>" + this.getModel("main").createKey("/PartnerFunctionSet", {
				Pargr: partnerProfile,
				Parvw: partnerFunction
			});
			const oTemplate = new CustomListItem({
				content: [
					new Text({
						text: "{main>PartnerId} {main>PartnerLongName}"
					})
				]
			});
			// bind list item with partner list Vs. partner function
			sap.ui.getCore().byId("partnerList").bindAggregation("items", {
				path: sPath + "/PartnerSet",
				template: oTemplate,
				templateShareable: false
			});
			// Bind list control with partner function
			sap.ui.getCore().byId("partnerList").bindElement({
				path: sPath
			});
			this.getModel("main").refresh();
		};
		/**
		 * on Partner selected	 
		 *
		 * @method		onPartnerSelected
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{sap.ui.base.Event} oEvent	event 
		 * @public
		 */
		Component.prototype.onPartnerSelected = function (oEvent) {
			const oSelected = oEvent.getParameter("listItem").getBindingContext("main").getObject();
			const oPartners = this.getModel("partners").getData();
			const oPartnerFunction = oEvent.getSource().getBindingContext("main").getObject();
			if (oPartnerFunction.Unique && oPartners.some(function (row) {
					return row.PartnerFct === oPartnerFunction.Parvw;
				})) {
				MessageToast.show(this.getText("UniquenessError", [oPartnerFunction.Vtext]));
			} else {
				oPartners.push(oSelected);
				this.getModel("partners").refresh();
				this.firePartnerAdded({
					partners: this.getModel("partners").getData(),
					newPartner: oSelected
				});
			}
			this._addDialog.close();
		};

		/**
		 * Eventhandler called when the user clicks on the delete-button of a line in the <code>sap.m.Table</code>.
		 *
		 * @method		onDeleteParterLine
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 * @param		{sap.ui.base.Event}				oEvent				the delete-event
		 */
		Component.prototype.onDeleteParterLine = function (oEvent) {
			const oContext = oEvent.getParameter("listItem").getBindingContext("partners");
			const oPartners = this.getModel("partners").getData();
			const oDeletedPartner = new Merge({}, oContext.getObject());
			oPartners.splice(oContext.getPath().slice(1), 1);
			this.getModel("partners").refresh();
			this.firePartnerDeleted({
				partners: this.getModel("partners").getData(),
				deletedPartner: oDeletedPartner
			});
		};
		/**
		 * Partner add dialog close without selection
		 *
		 * @method		onAddPartnerClose
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @param		{sap.ui.base.Event} oEvent	event 
		 * @public
		 */
		Component.prototype.onAddPartnerClose = function (oEvent) {
			this._addDialog.close();
		};
		/**
		 * Eventhandler called when the user presses on the search-button. 
		 *
		 * @method		onPartnerSearch
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 * @param		{sap.ui.base.Event}	oEvent	the press-event
		 */
		Component.prototype.onPartnerSearch = function (oEvent) {
			const sValue = oEvent.getParameter("query").toUpperCase();
			let oFilter = [];
			if (sValue) {
				oFilter = [new Filter("Search", sap.ui.model.FilterOperator.Contains, sValue)];
			}
			var oBinding = oEvent.getSource().getParent().getParent().getBinding("items");
			oBinding.filter(oFilter);
		};

		/**
		 * Eventhandler called when the add partner dialog is closed
		 * @method		onAddPartnerDialogAfterClose
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @public
		 * @param		{sap.ui.base.Event}	oEvent	the press-event
		 */
		Component.prototype.onAddPartnerDialogAfterClose = function (oEvent) {
			sap.ui.getCore().byId("partnerProfileCombo").setSelectedKey();
			sap.ui.getCore().byId("partnerSearchField").setValue();
			sap.ui.getCore().byId("partnerList").unbindAggregation("items");
			sap.ui.getCore().byId("partnerList").unbindElement("main");
			//oBinding.filter([]);
		};
		//=============================================================================
		// PRIVATE APIS
		//=============================================================================

		/**
		 * Returns the partenr fragment instance if it exists, creates it otherwise and
		 * then returns it.
		 *
		 * @method		_getPartnerTable
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @returns		{fragment}				The valuehelp dialog
		 * @private
		 */
		Component.prototype._getPartnerTable = function () {
			return new Promise(function (resolve, reject) {
				if (!this._partnersTable) {
					Fragment.load({
						name: "be.infrabel.ps.reuse.relatedPartnerTable.fragment.Partner",
						controller: this
					}).then(function (oFragment) {
						this._partnersTable = oFragment;
						resolve(this._partnersTable)
					}.bind(this));
				} else {
					resolve(this._partnersTable)
				};
			}.bind(this));
		};


		/**
		 * Returns the add partner fragment instance if it exists, creates it otherwise and
		 * then returns it.
		 *
		 * @method		_getAddPartnerDialog
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.relatedPartnerTable.Component
		 * @returns		{fragment}				The valuehelp dialog
		 * @private
		 */
		Component.prototype._getAddPartnerDialog = function () {
			return new Promise(function (resolve, reject) {
				if (!this._addDialog) {
					Fragment.load({
						name: "be.infrabel.ps.reuse.relatedPartnerTable.fragment.AddDialog",
						controller: this
					}).then(function (oFragment) {
						this._addDialog = oFragment;
						resolve(this._addDialog)
					}.bind(this));
				} else {
					resolve(this._addDialog)
				};
			}.bind(this));
		};
		return Component;
	}
);
