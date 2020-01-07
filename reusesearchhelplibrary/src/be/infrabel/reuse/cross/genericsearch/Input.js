sap.ui.define([
	"sap/m/Input",
	"be/infrabel/reuse/cross/genericsearch/Helper",
], function (BaseInput, Helper) {
	"use strict";
	var oControl = BaseInput.extend("be.infrabel.reuse.cross.genericsearch.Input", /** @lends be.infrabel.reuse.cross.genericsearch.Input*/ {
		metadata: {
			library: "be.infrabel.reuse.cross.genericsearch",
			properties: {
				compId: {
					type: "string"
				},
				appId: {
					type: "string"
				},
				searchHelpId: {
					type: "string"
				},
				searchTitle: {
					type: "string"
				},
				displayMode: {
					type: "string",
					defaultValue: ""
				},
				listWithKey: {
					type: "boolean",
					defaultValue: true
				},
				dependencyField: {
					type: "string"
				},
				dependencyKey: {
					type: "string"
				},
				dependencyFieldDescription: {
					type: "string"
				},
				dependencyRequired: {
					type: "boolean",
					defaultValue: false
				},
				sorter: {
					type: "sap.ui.model.Sorter"
				},
			}
		},
		helper : new Helper(),
		title: undefined,
		loaded: false,
		local: false,
		path: "",
		filter: [],
		template: undefined,
		valueHelpComponent: undefined,
		renderer: {},
		applySettings: function () {
			BaseInput.prototype.applySettings.apply(this, arguments);
			 this.helper.isLoaded(this.getCompId())
			 .then(function (oValueHelpComponent) {				
				if (oValueHelpComponent) {
					this.valueHelpComponent = oValueHelpComponent;
					oValueHelpComponent.setControlSettings(this);
					//this.attachModelContextChange(oValueHelpComponent.handleEvent, oValueHelpComponent);
					if (this.getShowValueHelp()) {
						this.attachValueHelpRequest(oValueHelpComponent.handleEvent, oValueHelpComponent);
					}
					if (!this.getValueHelpOnly()) {
						this.attachChange(oValueHelpComponent.handleEvent, oValueHelpComponent);
					}
					if (!this.local && this.getShowSuggestion()) {
						this.attachSuggest(oValueHelpComponent.handleEvent, oValueHelpComponent);
					}
					// if dependency exist 
					if (this.getDependencyField()) {
						// -> build search title in consequence
						oValueHelpComponent.getDependencyFieldDescription(this);
					}
					if (!this.getBinding("suggestionItems")) {
						oValueHelpComponent.buildSuggestion(this);
					}
				}
			}.bind(this));		
		},
		onBeforeRendering: function () {
			BaseInput.prototype.onBeforeRendering.call(this);
			if (!this.loaded) {
				// the following must be done only once at first rendering
				this.loaded = true;
				//build title for search popup
				let title = this.getSearchTitle();
				if (!title) {
					//title not given at construction
					if (this.getLabels().length) {
						// title is taken from label attached
						title = this.getLabels()[0].getText();
					} else if (this.getParent() && this.getParent().getlabel()) {
						// title is taken from label attached ( form )
						title = this.getParent().getLabel().getText();
					}
					// set back title in input property
					this.setSearchTitle(title);
				}
				// attach a listener to the dependency key modification
				if (this.getBindingInfo("dependencyKey") && this.getBindingInfo("dependencyKey").binding) {
					this.getBindingInfo("dependencyKey").binding.attachChange(function () {
						// dependency has change --> clear input
						this.setSelectedKey();
						this.valueHelpComponent.buildTitleVsDependency(this);
						if (this.getBinding("suggestionItems")) {
							this.valueHelpComponent.buildSuggestion(this);
						}
					}.bind(this))
				}
			}
			this.helper.isLoaded(this.getCompId())
			.then(function (oValueHelpComponent) {	
				oValueHelpComponent.initializeValue(this);
			}.bind(this));
		}
	});	
	return oControl;
});
