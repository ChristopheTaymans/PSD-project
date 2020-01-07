sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"sap/ui/model/json/JSONModel",
	"be/infrabel/reuse/cross/genericsearch/Helper",
	"sap/m/MessageToast"
], function (UIComponent, Device, models, JSON, InputHelper, MessageToast) {
	"use strict";
	/**
	 * @author      Christophe Taymans
	 * @extends     sap/ui/core/UIComponent
	 * @name        be.infrabel.psd.Component
	 * @class       be.infrabel.psd.Component
	 * component
	 */
	var oComponent = UIComponent.extend("be.infrabel.psd.Component", /**@lends be.infrabel.psd.Component.prototype **/ {
		_formFragments: {},
		metadata: {
			manifest: "json"			
		},
		valueHelpComponent : undefined,
		gitUrl : "https://git/sapfiori/projectsystem/projectscopedefinition.git"
	});
	/**
	 * called at component initialisation
	 * @method init
	 * @public
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.Component
	 * @author Christophe Taymans
	 **/
	oComponent.prototype.init = function () {
		var oGlobalModel;
		var oTreeModel;
		// call the base component's init function
		UIComponent.prototype.init.apply(this, arguments);
		// set the device model
		this.setModel(models.createDeviceModel(), "device");
		// set the FLP model
		this.setModel(models.createFLPModel(), "FLP");
		// set the message manager model
		this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		//initialze the global data
		const defaultSpan = this.getManifestEntry("sap.ui5").defaultSpan;
		this.setModel(new JSON(defaultSpan), "span");
		oGlobalModel = this.getModel("global");
		oGlobalModel.setData({
			projectId: undefined,
			inboxCalled:false,
			headerToolbar:false,
			treeLoaded: false,
			profileLoaded: false,
			worklistFilterKey: undefined,
			isValid: false,
			toSave: false,
			edit: false,
			approved: false,
			displayOnly: false,
			error: false,
			busy: false,
			delay: 0,
			oItem: undefined,
			treeColumnExpanded: false,
			oInvestmentComponent: undefined,
			oPartnerComponent: undefined,
			//oValueHelpComponent: undefined,
			oGeoLocComponent: undefined,
			profileId: "PSD",
			projectProfile: undefined,
			wfComment:"",
			worklistFilter: [],
			worklistAction: [],
			newPartners: [],
			newGeoLoc: [],
			fieldRule: [{
					level: 0,
					requiredFields: [{
							key: "ProjectDefinition/ProjectDefinitionID",
							i18n: "projectdefinitionLabel"
						},
						{
							key: "ProjectDefinition/ProjectLeaderNumber",
							i18n: "projectleaderLabel"
						},
						{
							key: "Description",
							i18n: "wbsdescriptionLabel"
						}
					]
				},
				{
					level: 1,
					requiredFields: [{
							key: "Node",
							i18n: "wbselementLabel"
						},
						{
							key: "Description",
							i18n: "wbsdescriptionLabel"
						},
						{
							key: "wbs/ExtensiveDescription",
							i18n: "extensivedescriptionLabel"
						},
						{
							key: "wbs/PersonResponsableID",
							i18n: "personresponsibleLabel"
						},
						{
							key: "wbs/PositionID",
							i18n: "investmentprogramLabel"
						},
						{
							key: "wbs/DelPortfDirectService",
							i18n: "delportfdirectserviceLabel"
						},
						{
							key: "wbs/ProgramManagerService",
							i18n: "programmanagerserviceLabel"
						},
						{
							key: "wbs/ManagingService",
							i18n: "managingserviceLabel"
						},
						{
							key: "wbs/ManagingSpecialty",
							i18n: "managingspecialtyLabel"
						},
						{
							key: "wbs/Location",
							i18n: "geographicallocationLabel"
						}
					]
				},
				{
					level: 2,
					requiredFields: [{
							key: "Node",
							i18n: "wbselementLabel"
						},
						{
							key: "Description",
							i18n: "wbsdescriptionLabel"
						},
						{
							key: "wbs/ExtensiveDescription",
							i18n: "extensivedescriptionLabel"
						},
						{
							key: "wbs/PersonResponsableID",
							i18n: "personresponsibleLabel"
						},
						{
							key: "wbs/ExecutingService",
							i18n: "executingserviceLabel"
						},
						{
							key: "wbs/ExecutingSpecialty",
							i18n: "executingspecialtyLabel"
						}
					]
				},
				{
					level: 3,
					requiredFields: [{
							key: "Node",
							i18n: "wbselementLabel"
						},
						{
							key: "Description",
							i18n: "wbsdescriptionLabel"
						},
						{
							key: "wbs/ExtensiveDescription",
							i18n: "extensivedescriptionLabel"
						},
						{
							key: "wbs/PersonResponsableID",
							i18n: "personresponsibleLabel"
						},

						{
							key: "wbs/ProjectType",
							i18n: "projecttypeLabel"
						},
						{
							key: "wbs/InvestmentReason",
							i18n: "investmentreasonLabel"
						},
						{
							key: "wbs/ClassificationWBS",
							i18n: "classificationwbsLabel"
						},
						{
							key: "wbs/Scale",
							i18n: "scaleLabel"
						},
						{
							key: "wbs/PlanningMethodPL",
							i18n: "planningmethodplLabel"
						},
						{
							key: "wbs/PlanningMethodPM",
							i18n: "planningmethodpmLabel"
						}
					]
				},
				{
					level: "Quick",
					requiredFields: [{
							key: "PersonResponsableID",
							i18n: "ProjectLeaderLabel"
						},
						{
							key: "ProjectType",
							i18n: "projectprofileLabel"
						},
						{
							key: "FinishDate",
							i18n: "finishdateLabel"
						},
						{
							key: "StartDate",
							i18n: "startdateLabel"
						},
						{
							key: "MainTypeWork",
							i18n: "TypeOfMainWork"
						},
						{
							key: "InvestmentProgram",
							i18n: "investmentprogramLabel"
						},
						{
							key: "InvestmentProgramYear",
							i18n: "investmentprogramLabel"
						},
						{
							key: "PositionID",
							i18n: "investmentprogramLabel"
						}
					],
					requiredGrouped: [
						[{
								key: "Line",
								i18n: "Line"
							},
							{
								key: "Location",
								i18n: "Location"
							},
							{
								key: "District",
								i18n: "District"
							}
						]
					]
				}
			]
		});
		// initialize the dynamic search help tool
		new InputHelper({
			appId: "PSD",
			compId:"be.infrabel.psd",
			listToLoad: [
				"ProjectType",						
				"ProjectProfile",
				"ProjectToCreate",
				"Scale",
				"InvestmentReason",
				"DelPortfDirectServ",
				"ExecutingService",
				"ExecutingSpeciality",
				"WbsClassification",
				"ProgManService",
				"PlanningMethodPm",
				"PlanningMethodPl",
				"ManagingSpeciality",
				"GeographicalLocation",
				"ManagingService",
				"UnitICTRespExec",										
				"Track",		
				"District"
			]
		}).start()
		.then(function (oValueHelpComponent) {
			this.valueHelpComponent=oValueHelpComponent;
		}.bind(this))
		.catch(function (oError) {
			MessageToast.show(oError.message);
		}.bind(this));
		this.getRouter().initialize();
		const oComponentData = this.getComponentData();
		if (oComponentData && oComponentData["startupParameters"]){
			if (oComponentData.startupParameters["projectId"]){
				if(oComponentData.startupParameters["inboxCalled"]){
					this.getModel("global").setProperty("/inboxCalled", oComponentData.startupParameters["inboxCalled"][0]==="true" ? true : false);
				}
				if(oComponentData.startupParameters["headerToolbar"]){
					this.getModel("global").setProperty("/headerToolbar", oComponentData.startupParameters["headerToolbar"][0]==="true" ? true : false);
				}
			this.getRouter().navTo("ProjectStructureRoute", {
				projectId: oComponentData.startupParameters.projectId[0],
				mode: 'Display'
			},true);
		}}		
		oTreeModel = this.getModel("tree");
		oTreeModel.setData({
			oTree: null
		});
	};
	/**
	 * called at destruction
	 * @method destroy
	 * @private
	 * @instance
	 * @redefine 
	 * @memberof be.infrabel.psd.Component
	 * @author Christophe Taymans-Christophe Taymans
	 **/
	oComponent.prototype.destroy = function () {
		// call the base component's destroy function
		const settings = this.getModel("global").getData();
		if (settings.oPartnerComponent) {
			settings.oPartnerComponent.destroy();
		}
		if (settings.oInvestmentComponent) {
			settings.oInvestmentComponent.destroy()
		}
		if (settings.oGeoLocComponent) {
			settings.oGeoLocComponent.destroy()
		}
		if (this.valueHelpComponent) {
			this.valueHelpComponent.destroy();
		}
		UIComponent.prototype.destroy.apply(this, arguments);
	};
	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 * @method getContentDensityClass
	 * @public
	 * @instance
	 * @memberof be.infrabel.psd.Component
	 * @author Christophe Taymans    
	 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	oComponent.prototype.getContentDensityClass = function () {
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
	return oComponent;
});
