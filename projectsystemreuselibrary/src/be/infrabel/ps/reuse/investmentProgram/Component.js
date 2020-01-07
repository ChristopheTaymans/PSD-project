sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (
		UIComponent,
		JSONModel,
		Device,
		Filter,
		FilterOperator
	) {
		"use strict";

		/**
		 * Constructor for the Investment Program reusable component.
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 * <h3>Usage</h3>
		 *
		 * @name    	be.infrabel.ps.reuse.investmentProgram
		 * @alias   	be.infrabel.ps.reuse.investmentProgram
		 * @author  	Dieter Muylle - Christophe Taymans
		 * @license 	Infrabel Private
		 * @extends 	sap.ui.core.UIComponent
		 * @constructor
		 * @public
		 */
		const Component = UIComponent.extend(
			"be.infrabel.ps.reuse.investmentProgram.Component",
			/** @lends be.infrabel.ps.reuse.investmentProgram.Component.prototype **/
			{
				metadata: {
					manifest: "json",
					properties: {},
					aggregations: {},
					events: {
						/**
						 * Event raised when PositionId is selected
						 *
						 * @public
						 */
						PositionIdSelected: {
							parameters: {
								selectedItems: {
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
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @public
		 * @override
		 */
		Component.prototype.init = function () {

			this._resourceBundle = this.getModel("i18n").getResourceBundle();

			// Device Model
			const deviceModel = new JSONModel(Device);
			deviceModel.setDefaultBindingMode("OneWay");
			this.setModel(deviceModel, "device");

			var oData = {
				edit: false,
				InvestmentProgram: undefined,
				InvestmentProgramDescription: undefined,
				InvestmentProgramYear: undefined,
				PositionID: undefined,
				PositionIdDescription: undefined,
				Fbp: undefined,
				FbpDescription: undefined,
				CentralControllerName: undefined,
				CentralController: undefined,
				PersonResponsableName: undefined,
				PersonResponsableID: undefined
			};
			this.setModel(new JSONModel(oData), "main");

			UIComponent.prototype.init.apply(this, arguments);
		};

		/**
		 * Creates the root control representing the Component.
		 *
		 * @method		createContent
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @returns		{sap.m.Fragment}		the fragment
		 * @public
		 * @override
		 */
		Component.prototype.createContent = function () {
			return this._getInvestmentProgram();
		};

		/**
		 * Called by the calling application to initialize data
		 *
		 * @method		initializeData
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @public
		 * @override
		 */
		Component.prototype.initializeData = function (inputData) {
			var oData = this.getModel("main").getData();
			oData.InvestmentProgram = inputData.InvestmentProgram;
			oData.InvestmentProgramYear = inputData.InvestmentProgramYear;
			oData.PositionID = inputData.PositionID;
			this.getModel("main").refresh(true);
		};

		/**
		 * Called by the calling application to set edit mode vaue
		 *
		 * @method		setEditMode
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @public
		 * @override
		 */
		Component.prototype.setEditMode = function (bEdit) {
			this.getModel("main").setProperty("/edit", bEdit);
			this.getModel("main").refresh(true);
		};

		/**
		 * Called when the component is destroyed
		 *
		 * @method		destroy
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @public
		 * @override
		 */
		Component.prototype.destroy = function () {
			UIComponent.prototype.destroy.apply(this, arguments);
		};

		//=============================================================================
		// OVERRIDE SETTERS
		//=============================================================================

		//=============================================================================
		// PUBLIC APIS
		//=============================================================================



		//=============================================================================
		// EVENT HANDLERS
		//=============================================================================
		/**
		 * set the data in the model with the selected object data
		 *
		 * @method		onHandleValueHelpPositionId
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oEvent open the valuehelp event
		 * @private
		 */
		Component.prototype.onHandleValueHelpPositionId = function (oEvent) {
			//var oMainContext = this.getBindingContext("main");
			var oCurrentObject = this.getModel("main").getData();
			var sProgram = oCurrentObject.InvestmentProgram;
			var sYear = oCurrentObject.InvestmentProgramYear;

			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"be.infrabel.ps.reuse.investmentProgram.fragment.PositionIdSearchHelpDialog",
					this
				);
				this._oInvestmentProgram.addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			// only fill if year and program known otherwise nothing has to be shown
			if (sProgram != '' && sYear != '') {
				this._valueHelpDialog.getBinding("items").filter([
					this._createContainsFilter("Program", sProgram),
					this._createContainsFilter("ApprovalYear", sYear),
				]);
			};
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open();
		};
		/**
		 * set the data in the model with the selected object data
		 *
		 * @method		changeInvestmentProgramSelected
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oEvent change selection event of the Combobox
		 * @private
		 */
		Component.prototype.changeInvestmentProgramSelected = function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			// var oMainContext = this.getBindingContext("main");
			// var oCurrentObject = oMainContext.getObject();
			var oCurrentObject = this.getModel("main").getData();
			if (oSelectedItem) {
				var oSelectedObject = oSelectedItem.oBindingContexts.investmentProgram.getObject();
				oCurrentObject.InvestmentProgram = oSelectedObject.Program;
				oCurrentObject.InvestmentProgramDescription = oSelectedObject.ProgramDescription;
				oCurrentObject.InvestmentProgramYear = oSelectedObject.ApprovalYear;
			} else {
				oCurrentObject.InvestmentProgram = "";
				oCurrentObject.InvestmentProgramDescription = "";
				oCurrentObject.InvestmentProgramYear = "";
				oCurrentObject.PositionID= "";
				oCurrentObject.PositionIdDescription = "";
			};
			//this.getBindingContext("main").getModel().refresh(true);
			// fire position id selected event
			this.firePositionIdSelected({
				selectedItems: oCurrentObject
			});
		};
		/**
		 * on Change Position Id
		 *
		 * @method		onChangePositionId
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oEvent change selection event of the Combobox
		 * @private
		 */
		Component.prototype.onChangePositionId = function (oEvent) {
			var oCurrentObject = this.getModel("main").getData();
			if (oCurrentObject.PositionID) {
				oEvent.getSource().setSelectedKey("");
				oCurrentObject.PositionID = "";
			} else {
				oCurrentObject.InvestmentProgram = "";
				oCurrentObject.InvestmentProgramDescription = "";
				oCurrentObject.InvestmentProgramYear = "";
				oEvent.getSource().setSelectedKey("");
				oCurrentObject.PositionID = "";
			};
			this.firePositionIdSelected({
				selectedItems: oCurrentObject
			});
		};		
		//=============================================================================
		// PRIVATE APIS
		//=============================================================================
		/**
		 * sets the filters to search with.
		 * now only on text descriptions ( lowest level, level + 1, level + 2)
		 *
		 * @method		_onPositionIdSearch
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oEvent search event of the valuehelp
		 * @private
		 */
		Component.prototype._onPositionIdSearch = function (oEvent) {
			// var oMainContext = this.getBindingContext("main");
			// var oCurrentObject = oMainContext.getObject();

			var oCurrentObject = this.getModel("main").getData();

			var sProgram = oCurrentObject.InvestmentProgram;
			var sYear = oCurrentObject.InvestmentProgramYear;
			var sValue = oEvent.getParameter("value");
			var oFilterDescription = this._createContainsFilter("PositionDescription", sValue);
			var oFilterProgram = this._createContainsFilter("Program", sProgram);
			var oFilterYear = this._createContainsFilter("ApprovalYear", sYear);
			var oFilters = new sap.ui.model.Filter({
				filters: [
					oFilterDescription,
					oFilterProgram,
					oFilterYear
				],
				and: true
			});
			oEvent.getSource().getBinding("items").filter(oFilters);
		};
		/**
		 * create a 'contains' filter.
		 *
		 * @method		_createContainsFilter
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{string}				sKey field to set filter on
		 * @param		{string}				sValue value to filter
		 * @returns		{filter}	  			filter object
		 * @private
		 */
		Component.prototype._createContainsFilter = function (sKey, sValue) {
			return new Filter(
				sKey,
				sap.ui.model.FilterOperator.Contains, sValue
			);
		};
		/**
		 * confirm action on the position Id search help.
		 *
		 * @method		_onPositionIdConfirm
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object} oEvent confirm dialog button action
		 * @private
		 */
		Component.prototype._onPositionIdConfirm = function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this._setPositionIdData(oSelectedItem.oBindingContexts.investmentProgram.getObject());
			}
			oEvent.getSource().getBinding("items").filter([]);
		};
		/**
		 * confirm action on the position Id search help.
		 *
		 * @method		_setPositionIdData
		 * @author		Dieter Muylle - Christophe Taymans
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oSelectedObject selected Position Id
		 * @private
		 */
		Component.prototype._setPositionIdData = function (oSelectedObject) {
			// var omainContext = this.getBindingContext("main");
			var oCurrentObject = this.getModel("main").getData();
			oCurrentObject.PositionID = oSelectedObject.PositionId;
			oCurrentObject.PositionIdDescription = oSelectedObject.PositionDescription;
			oCurrentObject.Fbp = oSelectedObject.FBPartNumber;
			oCurrentObject.FbpDescription = oSelectedObject.FBPartName;
			oCurrentObject.CentralControllerName = oSelectedObject.CentralControllerName;
			oCurrentObject.CentralController = oSelectedObject.CentralControllerNumber;
			oCurrentObject.PersonResponsableName = oSelectedObject.ResponsibleName;
			oCurrentObject.PersonResponsableID = oSelectedObject.ResponsibleNumber;
			this.getModel("main").refresh(true);
			// fire position id selected event
			// this.firePositionIdSelected({
			// 	selectedItem: oCurrentObject
			// });
			this.firePositionIdSelected({
				selectedItems: this.getModel("main").getData()
			});
		};
		/**
		 * cancel action on the position Id search help
		 *
		 * @method		_onPositionIdCancel
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				oEvent cancel dialog button action
		 * @private
		 */
		Component.prototype._onPositionIdCancel = function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		};

		/**
		 * gets the fragment to be displayed.
		 *
		 * @method		_getInvestmentProgram
		 * @author		Dieter Muylle
		 * @memberof	be.infrabel.ps.reuse.investmentProgram.Component
		 * @param		{object}				componentData				Passed in component data
		 * @returns		{sap.m.Fragment}	  			fragment object
		 * @private
		 */
		Component.prototype._getInvestmentProgram = function () {
			if (!this._oInvestmentProgram) {
				this._oInvestmentProgram = this._createNewInvestmentProgram();
			};

			return this._oInvestmentProgram;
		};
		/**
		 *creates the investmentProgram fragment
		 * 
		 * @method		_createNewInvestmentProgram
		 * @author      Dieter Muylle
		 * @memberof    be.infrabel.ps.reuse.investmentProgram.Component
		 * @returns     {sap.m.Fragment}   component fragment
		 * @private
		 * 
		 */
		Component.prototype._createNewInvestmentProgram = function () {
			var oInvestmentProgram = sap.ui.xmlfragment(this.createId(),
				"be.infrabel.ps.reuse.investmentProgram.fragment.InvestmentProgram",
				this
			);

			return oInvestmentProgram;
		};

		return Component;
	}
);
