sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/core/Fragment",
		"sap/base/util/merge",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"be/infrabel/reuse/cross/genericsearch/Helper",
	],
	function (UIComponent, JSONModel, Device, Fragment, Merge, MessageToast, MessageBox, Filter, FilterOperator, Sorter, InputHelper) {
		"use strict";
		/**
		 * Constructor for the geolocalisation Reusable Component.
		 *
		 * @class		
		 *
		 * This reusable component manage a <code>sap.m.Table</code> with information about geolocalisation		
		 *
		 * @name    	be.infrabel.ps.reuse.geoLocalisation
		 * @alias   	be.infrabel.ps.reuse.geoLocalisation
		 * @author  	Christophe Taymans
		 * @license 	Infrabel Private
		 * @extends 	sap.ui.core.UIComponent
		 * @constructor
		 * @public
		 */
		const Component = UIComponent.extend(
			"be.infrabel.ps.reuse.geoLocalisation.Component",
			/** @lends be.infrabel.ps.reuse.geoLocalisation.Component.prototype **/
			{
				metadata: {
					manifest: "json",
					properties: {
						GeoLocContainer: {
							type: "object"
						},
						geoTypeFragment: {
							type: "object"
						},
						geoEmptyFragment: {
							type: "object"
						},
						geoDataFragment: {
							type: "object"
						},
						valueHelpComponent: {
							type: "object"
						},
						lrpDataFragment: {
							type: "object"
						},
						flocHelpFragment: {
							type: "object"
						},
						lrpEditFragment: {
							type: "object"
						},
						lrpSelectFragment: {
							type: "object"
						},
						lrpMarkerSelectFragment: {
							type: "object"
						},
						sortSettingFragment: {
							type: "object"
						},
						geoDataTemplate: {
							type: "object",
							defaultValue: {
								Key: undefined,
								Description: "",
								MarkerStart: "",
								MarkerDistSta: "",
								MarkerEnd: "",
								MarkerDistEnd: "",
								StartPoint: "",
								EndPoint: "",
								LinearUnit: ""
							}
						},
						GeographicalLocation: {
							type: "string"
						}
					},
					aggregations: {},
					events: {
						/**
						 * Event raised when data is added 
						 * @public
						 */
						geoDataAdded: {
							parameters: {
								geoLocalisation: {
									type: "object"
								},
								newGeoLocalisation: {
									type: "object"
								}
							}
						},
						/**
						 * Event raised when data is deleted
						 * @public
						 */
						geoDataDeleted: {
							parameters: {
								geoLocalisation: {
									type: "object"
								},

								deletedGeoLocalisation: {
									type: "object"
								}
							}
						}
					}
				}
			}
		);
		/**
		 * Initialization of the component
		 *
		 * @method		init
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @public
		 * @override
		 */
		Component.prototype.init = function () {
			let aMultiselect = false;
			// Get the component data passed in.
			const oCompData = this.getComponentData();
			//get component data anstore it in compoent properties
			if (typeof oCompData.flMultiSelect === "boolean") {
				aMultiselect = oCompData.flMultiSelect;
			}

			this.setModel(
				new JSONModel({
					edit: false,
					saveEnabled: false,
					oItem: undefined,
					count: 0,
					total: 0,
					flNoDataText: this.getText("chooseObjectType"),
					flMultiSelect: aMultiselect,
					objectType: "0",
					markerBinding: undefined
				}),
				"settings"
			);
			// set data model
			this.setModel(
				new JSONModel({
					Level: "1",
					GeoData: [Merge({}, this.getGeoDataTemplate())]
				}),
				"data"
			);
			// Device Model
			const deviceModel = new JSONModel(Device);
			deviceModel.setDefaultBindingMode("OneWay");
			this.setModel(deviceModel, "device");
			// initialize the value help reusable component
			this._InputHelper = new InputHelper({
					appId: "PSD",
					compId: "be.infrabel.ps.reuse.geoLocalisation",
					listToLoad: [
						"GeographicalLocation",
						"District",
						"LengthUnit"
					]
				}).start()
				.then(function (oValueHelpComponent) {
					this.setValueHelpComponent(oValueHelpComponent);
					oValueHelpComponent.attachItemSelected(function (oEvent) {
						const oSelectedItem = oEvent.getParameter("selectedItem");
						const newGeoLoc = Merge({}, this.getGeoDataTemplate());
						newGeoLoc.Key = oSelectedItem.key;
						newGeoLoc.Description = oSelectedItem.value;
						newGeoLoc.Levl = this.getModel("data").getProperty("/Level");
						this._addGeoLoc(newGeoLoc);
					}.bind(this));
				}.bind(this))
				.catch(function (oError) {
					MessageToast.show(oError.message);
				}.bind(this));
			UIComponent.prototype.init.apply(this, arguments);
		};
		/**
		 * Creates the root control, a sap.m.VBox thta contains the Component.
		 *
		 * @method		createContent
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @returns		{fragment}				The entry point of the component 
		 * @public
		 * @override
		 */
		Component.prototype.createContent = function () {
			const oVBox = new sap.m.VBox();
			// attach all model to VBox --> all dependent fragment will have acces to models
			oVBox.setModel(this.getModel("settings"), "settings");
			oVBox.setModel(this.getModel("main"), "main");
			oVBox.setModel(this.getModel("i18n"), "i18n");
			oVBox.setModel(this.getModel("searchHelp"), "searchHelp");
			oVBox.addStyleClass(this._getContentDensityClass());
			this.setGeoLocContainer(oVBox);
			return oVBox;
		};
		/**
		 * Called when the component is destroyed
		 *
		 * @method		destroy
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @public
		 * @override
		 */
		Component.prototype.destroy = function () {
			if (this.getGeoTypeFragment()) {
				this.getGeoTypeFragment().destroy();
			}
			if (this.getGeoEmptyFragment()) {
				this.getGeoEmptyFragment().destroy();
			}
			if (this.getGeoDataFragment()) {
				this.getGeoDataFragment().destroy();
			}
			if (this.getValueHelpComponent()) {
				this.getValueHelpComponent().destroy();
			}
			if (this.getLrpDataFragment()) {
				this.getLrpDataFragment().destroy();
			}
			if (this.getFlocHelpFragment()) {
				this.getFlocHelpFragment().destroy();
			}
			if (this.getLrpEditFragment()) {
				this.getLrpEditFragment().destroy();
			}
			if (this.getLrpMarkerSelectFragment()) {
				this.getLrpMarkerSelectFragment().destroy();
			}
			if (this.getLrpSelectFragment()) {
				this.getLrpSelectFragment().destroy();
			}
			if (this.getSortSettingFragment()) {
				this.getSortSettingFragment().destroy();
			}
			UIComponent.prototype.destroy.apply(this, arguments);
		};
		//=============================================================================
		// PUBLIC APIS
		//=============================================================================
		/**
		 * Getter for i18n ressource
		 *
		 * @method		getText
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
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
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param		{string} sProperty - the property name
		 * @param		{string} sValue - the property value 
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
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param		{string} sProperty - the property name		 * 
		 * @returns		{value}	the property value
		 * @public
		 */
		Component.prototype.getSetting = function (sProperty) {
			return this.getModel("settings").getProperty("/" + sProperty);
		};
		/**
		 * Setter for geodata from caller
		 *
		 * @method		setGeoLoc
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param		{object} aGeoloc the geodata from the caller	
		 * @public
		 */
		Component.prototype.setGeoLoc = function (aGeoloc) {
			this.getModel("data").setData({
				Level: aGeoloc.length ? aGeoloc[0].Levl : "0",
				GeoData: aGeoloc.map(function (row) {
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
					};
				})
			});
			if (this.getFlocHelpFragment()) {
				//clear functional location value help table, reset segmented button and clear filter
				sap.ui.getCore().byId("flocSegmentedButton").setSelectedKey("0");
				sap.ui.getCore().byId("FlocTable").getBinding("items").filter([new Filter("ObjectType", FilterOperator.EQ, "dummyUI5")], "Control");
				sap.ui.getCore().byId("FlocTable").destroyItems();
				this.setSetting("flNoDataText", this.getText("chooseObjectType"));
			}
			this._buildGeoDataTable();
		};
		/**
		 * Setter for the mode property
		 *
		 * @method		setEditMode
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param		{boolean} bEdit	edit Mode flag
		 * @public
		 */
		Component.prototype.setEditMode = function (bEdit) {
			this.setSetting("edit", bEdit);
		};
		/**
		 * Setter for the wbs geographical location
		 *
		 * @method		setGeographicalLocation
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param		{string} sGeographicalLocation	Geographical Location
		 * @public
		 */
		Component.prototype.setGeoLocation = function (sGeographicalLocation) {
			if (sGeographicalLocation) {
				this.setGeographicalLocation(sGeographicalLocation);
			} else {
				this.setGeographicalLocation("Error")
			};
		};
		//=============================================================================
		// PRIVATE APIS
		//=============================================================================
		/**
		 * Returns a promise to load all fragments instances 
		 *
		 * @method		_getFragments
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @returns		{promise}	The fragment load promise
		 * @private
		 */
		Component.prototype._getFragments = function () {
			return new Promise(function (resolve) {
				let fragmentPromises = [];
				fragmentPromises.push(this._getAFragment("GeoLocType", "geoTypeFragment"));
				fragmentPromises.push(this._getAFragment("GeoLocEmpty", "geoEmptyFragment"));
				fragmentPromises.push(this._getAFragment("GeoLocData", "geoDataFragment"));
				fragmentPromises.push(this._getAFragment("LrpData", "lrpDataFragment"));
				Promise.all(fragmentPromises).then(function () {
					resolve();
				}.bind(this));
			}.bind(this));
		};
		/**
		 * Returns a  promise to load a fragment instance if it exists, creates it otherwise and
		 * then returns it.
		 *
		 * @method		_getAFragment
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @param 		{string} sfragment - the fragment name
		 * @param		{fragment} oHandler - the handler of the named fragment
		 * @returns		{promise} -The promise
		 * @private
		 */
		Component.prototype._getAFragment = function (sfragment, sFragmentProperty) {
			const sProperty = sFragmentProperty;
			const oFragmentProperty = this.getProperty(sProperty);
			return new Promise(function (resolve, reject) {
				if (!oFragmentProperty) {
					Fragment.load({
						name: "be.infrabel.ps.reuse.geoLocalisation.fragment." + sfragment,
						controller: this
					}).then(function (oFragment) {
						oFragment.addStyleClass(this._getContentDensityClass());
						this.setProperty(sProperty, oFragment);
						resolve({
							oFragment: oFragment,
							bInit: true
						})
					}.bind(this));
				} else {
					resolve({
						oFragment: oFragmentProperty,
						bInit: false
					})
				};
			}.bind(this));
		};
		//=============================================================================
		// EVENT HANDLERS
		//=============================================================================
		/**
		 *  on Add geo datapressed
		 *
		 * @method		onAddPress
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onAddPress = function () {
			const oGeolocData = this.getModel("data").getData();
			switch (oGeolocData.Level) {
				case "1": //funct location
					if (this.getGeographicalLocation() === "Error") {
						MessageToast.show(this.getText("missingGeographicalLocation"));
						return;
					}
					this._getAFragment("FunctionalLocationValue", "flocHelpFragment").then(function (oEvent) {
						if (oEvent.bInit) {
							this.getGeoLocContainer().addDependent(oEvent.oFragment);
						}
						sap.ui.getCore().byId("FlocTable").removeSelections();
						oEvent.oFragment.open();
					}.bind(this));
					break;
				case "2": //LRP
					this._getAFragment("LrpEdit", "lrpEditFragment").then(function (oEvent) {
						oEvent.oFragment.setModel(new JSONModel(Merge({}, this.getGeoDataTemplate())), "lrp");
						this.setSetting("saveEnabled", false);
						if (oEvent.bInit) {
							this.getGeoLocContainer().addDependent(oEvent.oFragment);
							oEvent.oFragment.getModel("lrp").attachPropertyChange(function () {
								this.setSetting("saveEnabled", this._isRequiredFieldOk(this.getLrpEditFragment(), "LRP"));
							}.bind(this))
						}
						oEvent.oFragment.open();
					}.bind(this));
					break;
				case "3": //District
					this.getValueHelpComponent().callValueHelp(this.getText("District"), "District", true).then(function (oValueHelp) {
						this.getGeoLocContainer().addDependent(oValueHelp);
						oValueHelp.open();
					}.bind(this));
					break;
				case "4": //Location
					this.getValueHelpComponent().callValueHelp(this.getText("Location"), "GeographicalLocation", true).then(function (oValueHelp) {
						this.getGeoLocContainer().addDependent(oValueHelp);
						oValueHelp.open();
					}.bind(this));
					break;
				default:
					break;
			}
		};
		/**
		 *  on sort button pressed
		 *
		 * @method		onSortButtonPressed
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onSortButtonPressed = function (oEvent) {
			this._getAFragment("SortSetting", "sortSettingFragment").then(function (oEvent) {

				if (oEvent.bInit) {
					this.getGeoLocContainer().addDependent(oEvent.oFragment);
				}
				oEvent.oFragment.open();
			}.bind(this));
		};
		/**
		 *  on sort dialog confirm
		 *
		 * @method		onSortDialogConfirm
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onSortDialogConfirm = function (oEvent) {
			const  oTable = sap.ui.getCore().byId("FlocTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items");
			let	sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		};
		/**
		 * Eventhandler called when the user clicks on the delete-button of a line 
		 *
		 * @method		onDeleteLine
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component
		 * @private
		 * @param		{sap.ui.base.Event}	oEvent	the delete-event
		 */
		Component.prototype.onDeleteLine = function (oEvent) {
			const oContext = oEvent.getParameter("listItem").getBindingContext("data");
			const oGeolocData = this.getModel("data").getData();
			const oDeletedLine = new Merge({}, oContext.getObject());
			oGeolocData.GeoData.splice(oContext.getPath().slice(1).split("/")[1], 1);
			this.getModel("data").refresh();
			this.fireGeoDataDeleted({
				geoLocalisation: this.getModel("data").getData().GeoData,
				deletedGeoLocalisation: oDeletedLine
			});
		};
		/**
		 * manage sub fragment of geo loc data Vs level
		 *
		 * @method		onLevelChange
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @private
		 */
		Component.prototype.onLevelChange = function (oEvent) {
			const oSegmentedButton = oEvent.getSource();
			if (this.getModel("data").getData().GeoData.length) {
				MessageBox.warning(
					this.getText("typeChangWarning"), {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (sAction) {
							const oGeoLoc = this.getModel("data").getData();
							switch (sAction) {
								case sap.m.MessageBox.Action.YES:
									oGeoLoc.GeoData.forEach(function (oRow) {
										this.fireGeoDataDeleted({
											geoLocalisation: [],
											deletedGeoLocalisation: oRow
										});
									}.bind(this));
									oGeoLoc.GeoData = [];
									this._buildGeoDataTable();
									break;
								default:
									oGeoLoc.Level = oGeoLoc.GeoData[0].Levl;
									oSegmentedButton.setSelectedKey(oGeoLoc.Level);
									break;
							}
						}.bind(this)
					}
				);
			} else {
				this._buildGeoDataTable();
			}
		};
		/**
		 * build the geo data table Vs level
		 *
		 * @method		_buildGeoDataTable
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype._buildGeoDataTable = function () {
			this._getFragments().then(function () {
				const oGeolocContainer = this.getGeoLocContainer();
				oGeolocContainer.removeAllItems();
				const oGeolocData = this.getModel("data").getData();
				switch (oGeolocData.Level) {
					case "1":
						oGeolocData.LevelKey = this.getText("FunctionalLocation");
						oGeolocContainer.addItem(this.getGeoDataFragment());
						break;
					case "2":
						oGeolocData.LevelKey = this.getText("LRP");
						oGeolocContainer.addItem(this.getLrpDataFragment());
						break;
					case "3":
						oGeolocData.LevelKey = this.getText("District");
						oGeolocContainer.addItem(this.getGeoDataFragment());
						break;
					case "4":
						oGeolocData.LevelKey = this.getText("Location");
						oGeolocContainer.addItem(this.getGeoDataFragment());
						break;
					default:
						oGeolocContainer.addItem(this.getGeoEmptyFragment());
						break;
				}
				this.getModel("data").refresh();
			}.bind(this));
		};
		/**
		 * add a geoloc data segment in table
		 *
		 * @method		_addGeoLoc
		 * @author		Christophe Taymans
		 * @param 		{object} oGeolocItem - the data to add
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype._addGeoLoc = function (oGeolocItem) {
			const oGeolocData = this.getModel("data").getData();
			if (oGeolocData.GeoData.some(function (row) {
					return (row.Key === oGeolocItem.Key &&
						row.MarkerDistEnd === oGeolocItem.MarkerDistEnd &&
						row.MarkerDistSta === oGeolocItem.MarkerDistSta &&
						row.MarkerEnd === oGeolocItem.MarkerEnd &&
						row.MarkerStart === oGeolocItem.MarkerStart);
				})) {
				MessageToast.show(this.getText("duplicateErrorMessage"));
				return;
			};
			oGeolocData.GeoData.push(Merge({}, oGeolocItem));
			this.fireGeoDataAdded({
				geoLocalisation: Merge({}, oGeolocData.GeoData),
				newGeoLocalisation: Merge({}, oGeolocItem)
			});
			this.getModel("data").refresh();
		};
		/**
		 * check if all required field are fulfilled
		 *
		 * @method		_isRequiredFieldOk
		 * @author		Christophe Taymans
		 * @param 		{object} oParent - the control that contains fields to check
		 * @param 		{string} sFieldGroup - the field group of fields to check
		 * @returns     {boolean} - indicator true if it is fullfilled
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype._isRequiredFieldOk = function (oParent, sFieldGroup) {
			return !oParent.getControlsByFieldGroupId(sFieldGroup).some(function (oField) {
				if (oField.getValue) {
					return !oField.getValue();
				}
			});
		};
		/**
		 * on technical object type change
		 *
		 * @method		onTechObjectChange
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onTechObjectChange = function (oEvent) {
			const oSegmentedButton = oEvent.getSource();
			const oTable = sap.ui.getCore().byId("FlocTable");
			let aFilter = [];
			if (this.getGeographicalLocation()) {
				aFilter.push(new Filter("MainWorkCtr", FilterOperator.StartsWith, this.getGeographicalLocation()));
			}
			switch (oSegmentedButton.getSelectedKey()) {
				case "1": //Switch
					aFilter.push(new Filter("ObjectType", FilterOperator.EQ, "2010"));
					break;
				case "2": //Crossing
					aFilter.push(new Filter("ObjectType", FilterOperator.EQ, "3010"));
					break;
				case "3": //Power distribution
					aFilter.push(new Filter("ObjectType", FilterOperator.StartsWith, "73"), new Filter("ObjectType", FilterOperator.StartsWith, "76"));
					break;
				case "4": //Other
					aFilter.push(new Filter("ObjectType", FilterOperator.NE, "2010"),
						new Filter("ObjectType", FilterOperator.NE, "3010"),
						new Filter("ObjectType", FilterOperator.NotStartsWith, "73"),
						new Filter("ObjectType", FilterOperator.NotStartsWith, "76")
					);
					break;
				default:
					return;

			}
			this.setSetting("objectType", oSegmentedButton.getSelectedKey());
			this.setSetting("flNoDataText", this.getText("noFLData"));
			oTable.getBinding("items").filter(aFilter, "Control");
		};
		/**
		 * on floc search help close
		 *
		 * @method		onFlSearchClose
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onFlSearchClose = function (oEvent) {
			if (this.getSetting("flMultiSelect")) {
				sap.ui.getCore().byId("FlocTable").getSelectedItems().forEach(function (oItem) {
					const oSelectedItem = oItem.getBindingContext("main").getObject();
					const newGeoLoc = Merge({}, this.getGeoDataTemplate());
					newGeoLoc.Key = oSelectedItem.FlocId;
					newGeoLoc.Description = oSelectedItem.Pltxt;
					newGeoLoc.Levl = this.getModel("data").getProperty("/Level");
					this._addGeoLoc(newGeoLoc);
				}.bind(this));
			}
			this.getFlocHelpFragment().close();
		};
		/**
		 * on Floc Search
		 *
		 * @method		onFlSearch
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onFlSearch = function (oEvent) {
			var oItemsContext = sap.ui.getCore().byId("FlocTable").getBinding("items");
			oItemsContext.filter([new Filter("Search", FilterOperator.Contains, oEvent.getParameter("query"))], "Application");
		};
		/**
		 * on Floc Selected
		 *
		 * @method		onFlocSelected
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onFlocSelected = function (oEvent) {
			if (this.getSetting("flMultiSelect")) {
				return;
			}
			const oSelectedItem = oEvent.getParameter("listItem").getBindingContext("main").getObject();
			const newGeoLoc = Merge({}, this.getGeoDataTemplate());
			newGeoLoc.Key = oSelectedItem.FlocId;
			newGeoLoc.Description = oSelectedItem.Pltxt;
			newGeoLoc.Levl = this.getModel("data").getProperty("/Level");
			this._addGeoLoc(newGeoLoc);
			this.onFlSearchClose();

		};
		/**
		 * on Floc table Update Finished 
		 *
		 * @method		onFlocUpdateFinished 
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onFlocUpdateFinished = function (oEvent) {
			this.setSetting("count", oEvent.getParameter("actual"));
			this.setSetting("total", oEvent.getParameter("total"));
		};
		/**
		 * on LRP Save
		 *
		 * @method		onLRPsave
		 * @author		Christophe Taymans		
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onLRPSave = function () {
			const newGeoLoc = this.getLrpEditFragment().getModel("lrp").getData();
			newGeoLoc.Levl = this.getModel("data").getProperty("/Level");
			this.getModel("main").callFunction("/CalculateLrpPoint", {
				urlParameters: {
					LinearUnit: newGeoLoc.LinearUnit,
					MarkerStart: newGeoLoc.MarkerStart,
					MarkerDistSta: newGeoLoc.MarkerDistSta,
					MarkerEnd: newGeoLoc.MarkerEnd,
					MarkerDistEnd: newGeoLoc.MarkerDistEnd,
					Lrpid: newGeoLoc.Key
				},
				success: function (oData) {
					newGeoLoc.StartPoint = oData.CalculateLrpPoint.StartPoint;
					newGeoLoc.EndPoint = oData.CalculateLrpPoint.EndPoint;
					this._addGeoLoc(newGeoLoc);
					this.onLRPClose();
				}.bind(this),
				error: function () {
					this._addGeoLoc(newGeoLoc);
					this.onLRPClose();
				}.bind(this)
			});
		};
		/**
		 * on LRP close
		 *
		 * @method		onLRPclose
		 * @author		Christophe Taymans		
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onLRPClose = function () {
			this.getLrpEditFragment().close();
		};
		/**
		 * on LRP value help
		 *
		 * @method		onLrpValueHelp
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onLrpValueHelp = function () {
			this._getAFragment("LrpSelect", "lrpSelectFragment").then(function (oEvent) {
				this.getGeoLocContainer().addDependent(oEvent.oFragment);
				oEvent.oFragment.getBinding("items").filter(new Filter("LrpId", FilterOperator.StartsWith, "L"), "Control");
				oEvent.oFragment.open();
			}.bind(this));
		};
		/**
		 * on LRP markervalue help
		 *
		 * @method		onLrpMarkerValueHelp
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onLrpMarkerValueHelp = function (oEvent) {
			const oLrpData = this.getLrpEditFragment().getModel("lrp").getData();
			this.setSetting("MarkerBinding", oEvent.getSource().getBindingInfo("value"));
			if (!oLrpData.Key) {
				MessageToast.show(this.getText("EnterLrpid"));
				return;
			}
			this._getAFragment("LrpMarkerSelect", "lrpMarkerSelectFragment").then(function (oEvent) {
				this.getGeoLocContainer().addDependent(oEvent.oFragment);
				const sPath = this.getModel("main").createKey("/LrpSet", {
					LrpId: oLrpData.Key
				});
				oEvent.oFragment.bindElement({
					path: sPath,
					model: "main"
				});
				oEvent.oFragment.open();
			}.bind(this));
		};
		/**
		 * on LRP value help close
		 *
		 * @method		onLrpHelpClose
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onLrpHelpClose = function (oEvent) {
			const oSelecteditem = oEvent.getParameter("selectedItem");
			if (oSelecteditem) {
				this.getLrpEditFragment().getModel("lrp").setProperty("/Key", oSelecteditem.getBindingContext("main").getObject().LrpId);
				this.setSetting("saveEnabled", this._isRequiredFieldOk(this.getLrpEditFragment(), "LRP"));
			}
		};
		/**
		 * on LRP marker value selected
		 *
		 * @method		onMarkerSelected
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @private
		 */
		Component.prototype.onMarkerSelected = function (oEvent) {
			const oSelecteditem = oEvent.getParameter("listItem");
			if (oSelecteditem) {
				oSelecteditem.setSelected(false);
				const oData = oSelecteditem.getBindingContext("main").getObject();
				const oLrpModel = this.getLrpEditFragment().getModel("lrp");
				oLrpModel.setProperty("", oData.Marker, this.getSetting("MarkerBinding").binding);
				oLrpModel.setProperty("/LinearUnit", oData.LinearUnit);
				this.setSetting("saveEnabled", this._isRequiredFieldOk(this.getLrpEditFragment(), "LRP"));
			}
			this.onLrpMarkerHelpClose();
		};
		/**
		 * on LRP marker value help close
		 *
		 * @method		onLrpMarkerHelpClose
		 * @author		Christophe Taymans
		 * @private
		 */
		Component.prototype.onLrpMarkerHelpClose = function () {
			this.getLrpMarkerSelectFragment().close();
		};
		/**
		 * on Select Dialog Search
		 *
		 * @method		onSelectDialogSearch
		 * @author		Christophe Taymans
		 * @param		{sap.ui.base.Event}	oEvent	the event 
		 * @private
		 */
		Component.prototype.onSelectDialogSearch = function (oEvent) {
			if (oEvent.getParameter("value")) {
				oEvent.getSource().getBinding("items").filter(new Filter("Search", FilterOperator.Contains, oEvent.getParameter("value")), "Application");
			} else {
				oEvent.getSource().getBinding("items").filter([], "Application");
			}
		};
		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @method _getContentDensityClass
		 * @private
		 * @instance
		 * @memberof	be.infrabel.ps.reuse.geoLocalisation.Component	
		 * @author Christophe Taymans    
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		Component.prototype._getContentDensityClass = function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				// eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		};
		return Component;
	}
);
