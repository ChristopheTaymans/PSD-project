sap.ui.define([
	"sap/m/Select",
	"be/infrabel/reuse/cross/genericsearch/Helper",
], function (BaseInput, Helper) {
	"use strict";
	var oControl = BaseInput.extend("be.infrabel.reuse.cross.genericsearch.Select", /** @lends be.infrabel.reuse.cross.genericsearch.Select*/ {
		metadata: {
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
				displayMode: {
					type: "string",
					defaultValue: ""
				},
				sorter: {
					type: "sap.ui.model.Sorter"
				}
			}
		},
		local: false,
		path: "",
		filter: [],
		template: undefined,
		renderer: {},
		helper: new Helper,
		applySettings: function () {
			BaseInput.prototype.applySettings.apply(this, arguments);
			this.helper.isLoaded(this.getCompId())
				.then(function (oValueHelpComponent) {
					if (oValueHelpComponent) {
						oValueHelpComponent.setControlSettings(this);
						this.unbindItems();
						if (this.local) {
							//...for local data (short value list)
							oValueHelpComponent.isListLoaded().then(function () {
								this.setModel(oValueHelpComponent.getModel("valueList"));
							}.bind(this));
						} else {
							//...for backend data (long value list)
							this.setModel(oValueHelpComponent.getModel("main"));
						}
						this.bindItems({
							path: this.path,
							sorter: this.getSorter(),
							filters: this.filter,
							template: this.template,
							templateShareable: false
						});
					}
				}.bind(this));
		}
	});
	return oControl;
});
