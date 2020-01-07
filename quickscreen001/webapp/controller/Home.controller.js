sap.ui.define([
	"be/infrabel/psd/quickscreen01/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSON, MessageToast) {
	"use strict";
	var oController = BaseController.extend("be.infrabel.psd.quickscreen01.controller.Home"); /**@lends be.infrabel.psd.quickscreen01.controller.Home.prototype **/
	/**
	 * called at controler initialisation
	 * @method onInit
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onInit = function () {
		BaseController.prototype.onInit.apply(this, arguments);
		this.getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched, this);
		this.setModel(new JSON({
			freeTextShortLength: 40,
			freeTextLongLength: 132
		}), "viewModel");
		this.getOwnerComponent().getModel("main").metadataLoaded().then(function () {
			var oMainModel = this.getOwnerComponent().getModel("main");
			oMainModel.attachPropertyChange(function () {
				if (!this.getSetting("edit")) {
					this._isChangeOccured();
					this._validateScreen();
					this._deriveDescription().catch(function (oError) {
						this.showError(oError);
					}.bind(this));
				}
			}.bind(this));
		}.bind(this));
		sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
	};
	/**
	 * Binds the view to the  path and expands the aggregated line items.
	 * @method _onObjectMatched
	 * @private
	 * @instance
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author  Christophe Taymans
	 **/
	oController.prototype._onObjectMatched = function () {
		this.getOwnerComponent().getModel("main").metadataLoaded().then(function () {
			var sPath = this.getModel("main").createKey("/QuickScreenSet", {
				ProfileId: 'PSD',
				ActionId: 'Q0001'
			});
			this.getModel("main").invalidateEntry(sPath);
			this.getView().bindElement({
				path: sPath,
				model: "main",
				events: {
					dataRequested: function () {
						this.setBusy(true);
					}.bind(this),
					dataReceived: function () {
						this._validateScreen();	
						var oData = this.getBindObject();
						const oViewdata = this.getModel("viewModel").getData();
						oViewdata.freeTextShortLength = oData.RemainShort;
						oViewdata.freeTextLongLength = oData.RemainLong;
						this.getModel("viewModel").refresh();
						var oInvestmentComponent = this.getSetting("oInvestmentComponent");
						if (oInvestmentComponent) {
							oInvestmentComponent.setEditMode(true);						
							oInvestmentComponent.initializeData({
								InvestmentProgram: oData.InvestmentProgram,
								InvestmentProgramYear: oData.InvestmentProgramYear,
								PositionID: oData.PositionID
							});			
						}
						this.setBusy(false);
					}.bind(this)
				}
			});
		}.bind(this))
	};
	/**
	 * Event handler for create document event. 
	 * @method onCreate
	 * @public
	 * @instance
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCreate = function () {
		this.setBusy(true, 0);
		sap.ui.getCore().getMessageManager().removeAllMessages();
		this.getModel("main").setRefreshAfterChange(false);
		this.getModel("main").create("/QuickScreenSet",this.getBindObject(),{
			success: this.onSuccess.bind(this),
			error: this.onError.bind(this)
		});
	};
	/**
	 * cancel  creation	
	 * @method onCancel
	 * @public
	 * @instance
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype.onCancel = function () {
		this.onNavBack();
	};
	/**
	 * called at creation success	
	 * @method onSucces
	 * @public
	 * @instance
	 * @param {object} oData - created data
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype.onSuccess = function (oData) {
		this.setBusy(false);
		this.translateMessageTarget();
		if (this.getModel("message").getData().some(function (row) {
				return row.type === "Error";
			})) {
			MessageToast.show(this.getText("CreateErrorMessage"));
			this.setSetting("error", true);
			return;
		}
		MessageToast.show(this.getText("CreateSuccessMessage", [oData.Projectid]), {
			closeOnBrowserNavigation: false
		})
		this.onNavBack();
	};
	/**
	 * called at creation error
	 * @method onError
	 * @public
	 * @instance
	 * @param {Object} oError - error
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author  Christophe Taymans
	 **/
	oController.prototype.onError = function (oError) {
		this.showError(oError, true);
		this.setBusy(false);
	};
	/**
	 * called at investment component creation
	 * @method onInvestmentProgramComponentCreated
	 * @public
	 * @instance	
	 * @param {sap.ui.base.Event} oEvent the caller
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype.onInvestmentProgramComponentCreated = function (oEvent) {
		var oInvestmentComponent = oEvent.getParameter("component");
		var oData = this.getBindObject();
		if (oData) {
			oInvestmentComponent.initializeData({
				InvestmentProgram: oData.InvestmentProgram,
				InvestmentProgramYear: oData.InvestmentProgramYear,
				PositionID: oData.PositionID
			});
		}
		oInvestmentComponent.setEditMode(true);
		this.setSetting("oInvestmentComponent", oInvestmentComponent);
		oInvestmentComponent.attachPositionIdSelected({}, function (oEvent) {
			var oSelected = oEvent.getParameter("selectedItems");
			var oModel = this.getModel("main");
			var oContext = this.getViewBindingContext();
			oModel.setProperty("InvestmentProgram", oSelected.InvestmentProgram, oContext);
			oModel.setProperty("InvestmentProgramYear", oSelected.InvestmentProgramYear, oContext);
			oModel.setProperty("PositionID", oSelected.PositionID, oContext);
			this._isChangeOccured();
			this._validateScreen();
		}, this);
	};
	/**
	 * derive description
	 * @method onInvestmentProgramComponentCreated
	 * @private
	 * @instance
	 * @returns {promise} promise		 
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype._deriveDescription = function () {
		return new Promise(function (resolve, reject) {
			this.setBusy(true);
			const oData = this.getBindObject();
			this.getModel("main").callFunction("/DeriveDescription", {
				urlParameters: {
					FreeTextLong: oData.FreeTextLong,
					FreeTextShort: oData.FreeTextShort,
					MainTypeWork: oData.MainTypeWork,
					Line: oData.Line,
					Track: oData.Track,
					Location: oData.Location,
					BkFrom: !!oData.BkFrom ? oData.BkFrom : 0,
					BkTo: !!oData.BkTo ? oData.BkTo : 0,
					District: oData.District,
					ProfileId: oData.ProfileId
				},
				success: function (oData) {
					this.setSetting("error", false);
					this.setBusy(false);
					this.getModel("main").setProperty("Description", oData.DeriveDescription.Description, this.getViewBindingContext());
					this.getModel("main").setProperty("Comment", oData.DeriveDescription.Comment, this.getViewBindingContext());
					const oViewdata = this.getModel("viewModel").getData();
					oViewdata.freeTextShortLength = oData.DeriveDescription.RemainShort;
					oViewdata.freeTextLongLength = oData.DeriveDescription.RemainLong;
					this.getModel("viewModel").refresh();
					resolve(oData);
				}.bind(this),
				error: function (oError) {
					this.setSetting("error", true);
					this.setBusy(false);
					reject(oError);
				}.bind(this),
			});
		}.bind(this));
	};
	/**
	 * Validate screen data
	 * @method _validateScreen 
	 * @private
	 * @instance	 	 
	 * @memberof  be.infrabel.psd.quickscreen01.controller.Home
	 * @author Christophe Taymans
	 **/
	oController.prototype._validateScreen = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		const isInValid = this._isRequiredFieldEmpty(this.getBindObject(), 'Quick');
		this.setSetting("error", isInValid);
		this.setSetting("isValid", !isInValid);
	};
	return oController;
});
