sap.ui.define(
	[
		"sap/ui/core/Component",
		"be/infrabel/reuse/cross/genericsearch/Helper",
		"sap/ui/core/Fragment",
		"sap/m/CustomListItem",
		"sap/m/SuggestionItem",
		"sap/m/Text",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/base/util/merge",
		"be/infrabel/reuse/cross/genericsearch/Input"
	],
	function (Component, Helper, Fragment, CustomListItem, SuggestionItem, Text, Filter, Sorter, JSONModel, MessageToast, Merge, ReuseInput) {
		"use strict";
		/**
		 * Constructor for dynamicsearch help data reusable component. 
		 *		 
		 * <h3>Usage</h3>		 
         * see documentation in https://git/sapfiori/CrossApplication/reusesearchhelplibrary
		 *	
		/**
		 * Constructor for dynamicsearch help data reusable component. (faceless component)
		 * @class		 	 
		 * @name    	be.infrabel.reuse.cross.genericsearch
		 * @alias   	be.infrabel.reuse.cross.genericsearch
		 * @author  	Christophe Taymans
		 * @license 	Infrabel Private
		 * @extends 	sap.ui.core.Component
		 * @constructor
		 * @public
		 */
		const Comp = Component.extend(
			"be.infrabel.reuse.cross.genericsearch.Component",
			/** @lends be.infrabel.reuse.cross.genericsearch.Component.prototype */
			{
				constructor: function (sServiceUrl, mParameters) {
					Component.apply(this, arguments);
					var that = this;
					this.fnResolve;
					this.pLoaded = new Promise(function (resolve) {
						that.fnResolve = resolve;
					});
				},
				metadata: {
					manifest: "json",
					properties: {
						compId: {
							type: "string"
						},
						appId: {
							type: "string",
						},
						HelpId: {
							type: "string",
						},
						listWithkey: {
							type: "boolean",
						},
						searchHelpToLoad: {
							type: "array",
							defaultValue: []
						}
					},
					aggregations: {},
					events: {
						itemSelected: {
							parameters: {
								control: {
									type: "object",
								},
								selectedItem: {
									type: "object"
								}
							}
						},
						dataLoaded: {
							parameters: {
								data: {
									type: "object"
								}
							}
						},
						dataError: {
							parameters: {
								error: {
									type: "object"
								},
							}
						}
					}
				},
				callerInput: undefined,
				valueHelpDialog: undefined,
				listData: new JSONModel([]),
				gitUrl : "https://git/sapfiori/CrossApplication/reusesearchhelplibrary"
			}
		);
		/**
		 * initialization of the component.
		 *
		 * @method		init
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @public
		 */
		Comp.prototype.init = function () {
			// Get the component data passed in.
			const oCompData = this.getComponentData();
			//get component data anstore it in compoent properties
			if (typeof oCompData.appId === "string") { //app id
				this.setAppId(oCompData.appId);
			}
			if (typeof oCompData.compId === "string") { //app id
				this.setCompId(oCompData.compId);
			}
			if (typeof oCompData.listToLoad === "object") { //list of search id to load locally
				this.setSearchHelpToLoad(oCompData.listToLoad);
			};
			// read the requested local data and group the result
			this.getModel("main").metadataLoaded().then(function () {
				this._loadLocalData();
			}.bind(this));
		};
		/**
		 * destroy component
		 *
		 * @method		destroy
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @public
		 */
		Comp.prototype.destroy = function () {
			if (this.valueHelpDialog) {
				this.valueHelpDialog.destroy();
			}
			new Helper().deregister(this);
			Component.prototype.destroy.apply(this, arguments);
		};
		//=============================================================================
		// PUBLIC APIS
		//=============================================================================
		/**
		 * local data loading promise
		 * @method isListLoaded
		 * @public
		 * @instance
		 * @return {promise} the loaded promise
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.isListLoaded = function () {
			return this.pLoaded;
		}
		/**
		 * handle event of the calling input and dispartch to the corresponding function
		 * @method handlEvent
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oEvent the calling input's event
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.handleEvent = function (oEvent) {
			switch (oEvent.getId()) {
				case "modelContextChange":
					this.initializeValue(oEvent.getSource());
					break;
				case "valueHelpRequest":
					this._handleValueHelp(oEvent);
					break;
				case "suggest":
					this._handleValueSuggest(oEvent);
					break;
				case "suggestionItemSelected":
					this._handleSuggestValueSelected(oEvent);
					break;
				case "change":
					this._checkValue(oEvent);
					break;
				default:
					break;
			}
		};
		/**
		 * Initializing value at control opening
		 * @method initializeValue
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oEvent the calling input's event
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.initializeValue = function (oInput) {
			//const oInput = oEvent.getSource();
			const oModel = this.getModel("main");
			//this method is called when the bindingcontext of selectedkey is modified( it happens at the initalization of the input
			// it is called several time but we are interested only at the first time the selected key is binded.
			// at this time, we load the value of the corresponding key in order to intialize the input value
			try {
				var oBinding = oInput.getBindingInfo("selectedKey").binding;
				var oContext = oBinding.getContext();
			} catch (error) {
				// call if input is not yet completely defiend
				return;
			}
			if (!(oContext && !oInput.getValue())) {
				return;
			}
			var keyValue = oBinding.getValue();
			// bind the input with the corresponding path
			if (!oInput.getBinding("suggestionItems")) {
				this.setControlSettings(oInput);
				oInput.unbindAggregation("suggestionItems");
				if (oInput.local) {
					//...for local data (short value list)
					this.isListLoaded().then(function () {
						oInput.setModel(this.getModel("valueList"));
					}.bind(this));
				} else {
					//...for backend data (long value list)
					oInput.setModel(this.getModel("main"));
				}
				oInput.bindAggregation("suggestionItems", {
					path: oInput.path,
					sorter: oInput.getSorter(),
					filters: oInput.filter,
					template: oInput.template,
					templateShareable: false
				});
			}
			if (keyValue) {
				// initialize the exisiting data after rendering
				if (oInput.local) {
					this.isListLoaded().then(function () {
						const oSelected = this.listData.getData()[oInput.getSearchHelpId()].find(function (data) {
							return data.key === keyValue
						});
						if (!oSelected) {
							return;
						}
						switch (oInput.getDisplayMode()) {
							case "key":
								oInput.setValue(oSelected.key);
								break;
							case "value":
								oInput.setValue(oSelected.value);
								break;
							default:
								oInput.setValue(oSelected.key + " " + oSelected.value);
								break;
						}
						this.fireItemSelected({
							control: oInput,
							//setting: oSetting,
							selectedItem: {
								key: oSelected.key,
								value: oSelected.value
							}
						});
					}.bind(this));

				} else {
					const oFilter = Merge([], oInput.filter);
					oFilter.push(new Filter({
						path: 'key',
						operator: 'EQ',
						value1: keyValue
					}));
					oInput.setBusy(true);
					oModel.read('/SearchHelpValueSet', {
						filters: oFilter,
						success: function (oData) {
							oInput.setBusy(false);
							if (oData.results.length) {
								oInput.setSelectedKey(oData.results[0].key);
								switch (oInput.getDisplayMode()) {
									case "key":
										oInput.setValue(oData.results[0].key);
										break;
									case "value":
										oInput.setValue(oData.results[0].value);
										break;
									default:
										oInput.setValue(oData.results[0].key + " " + oData.results[0].value);
										break;
								}
								this.fireItemSelected({
									control: oInput,
									//setting: oSetting,
									selectedItem: {
										key: oData.results[0].key,
										value: oData.results[0].value
									}
								});
							} else {
								oInput.setValueState("Error");
							};
						}.bind(this),
						error: function () {
							oInput.setBusy(false);
						}
					});
				}
			}
		};

		/**
		 * build suggestion item
		 * @method buildSuggestion
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oInput the calling input
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.buildSuggestion = function (oInput) {
			this.setControlSettings(oInput);
			oInput.unbindAggregation("suggestionItems");
			if (oInput.local) {
				//...for local data (short value list)				
				this.isListLoaded().then(function () {
					oInput.setModel(this.getModel("valueList"));
					// oInput.bindAggregation("suggestionItems", {
					// 	path: oInput.path,
					// 	sorter: oInput.sorter,
					// 	filters: oInput.filter,
					// 	template: oInput.template,
					// 	templateShareable: false
					// })
				}.bind(this));
			} else {
				//...for backend data (long value list)
				oInput.setModel(this.getModel("main"));
			}
			oInput.bindAggregation("suggestionItems", {
				path: oInput.path,
				sorter: oInput.sorter,
				filters: oInput.filter,
				template: oInput.template,
				templateShareable: false
			})
		};
		/**
		 * call value Help from parent component
		 * @method _handleValueHelp
		 * @public
		 * @instance
		 * @param {string} searchHelpId the search help id to call
		 * @param {boolean} bListWithKey display the key in list
		 * @param {string} keyBinding binding path for the result
		 * @returns {promise} - a promise
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.callValueHelp = function (sTitle, searchHelpId, bListWithKey, sDependencyKey, sDependencyField) {
			const oParameters = {
				title: sTitle,
				searchHelpId: searchHelpId,
				listWithKey: bListWithKey,
				dependencyKey: sDependencyKey,
				dependencyField: sDependencyField
			};
			return new Promise(function (resolve) {
				const oSetting = this.buildSettings(oParameters);
				this.callerInput = oSetting;
				this._buildValueHelp(oSetting).then(function (oValueHelpDialog) {
					resolve(oValueHelpDialog);
				}.bind(this));
			}.bind(this));
		};
		/**
		 * handle value Help
		 * @method _handleValueHelp
		 * @private
		 * @instance
		 * @param {sap.ui.base.Event} oEvent the calling input's event
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype._handleValueHelp = function (oEvent) {
			const oInput = oEvent.getSource();
			this.callerInput = oInput;
			//const oSetting = this.setControlSettings(oInput);
			if (oInput.getDependencyRequired() && !oInput.getDependencyKey()) {
				MessageToast.show(this.getText("dependencyRequired", [oInput.getDependencyFieldDescription()]));
				return;
			}
			this._buildValueHelp(oInput).then(function (oValueHelpDialog) {
				oValueHelpDialog.open();
			}.bind(this));
		};
		/**
		 * build Value Help Vs setting
		 * @method _buildValueHelp
		 * @private
		 * @instance
		 * @param {string} searchHelpId the title
		 * @param {object} oSetting settings for value help
		 * @returns {promise} - a promise
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype._buildValueHelp = function (oInput) {
			let oSetting;
			if (oInput instanceof ReuseInput) {
				oSetting = {
					title: oInput.getSearchTitle(),
					listWithKey: oInput.getListWithKey(),
					local: oInput.local,
					path: oInput.path,
					sorter: oInput.getSorter(),
					filter: oInput.filter
				};
			} else {
				oSetting = oInput
			};
			return new Promise(function (resolve) {
				//const oSetting = this.setControlSettings(oInput);
				this._getValueHelpDialog().then(function (oValueHelpDialog) {
					let oTemplate;
					oValueHelpDialog.setTitle(oSetting.title);
					if (oSetting.listWithKey) {
						oTemplate = new CustomListItem({
							content: [
								new Text({
									text: "{key} {value}"
								})
							]
						});
					} else {
						oTemplate = new CustomListItem({
							content: [
								new Text({
									text: "{value}"
								})
							]
						});
					}
					oValueHelpDialog.unbindAggregation("items");
					if (oSetting.local) {
						this.isListLoaded().then(function () {
							oValueHelpDialog.setModel(this.getModel("valueList"));
						}.bind(this));
					} else {
						oValueHelpDialog.setModel(this.getModel("main"));
					}
					oValueHelpDialog.bindAggregation("items", {
						path: oSetting.path,
						sorter: oSetting.sorter,
						filters: oSetting.filter,
						template: oTemplate,
						templateShareable: false
					});
					resolve(oValueHelpDialog);
				}.bind(this));
			}.bind(this));
		};
		/**
		 * on Value Suggest
		 * @method _handleValueSuggest
		 * @private	
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	 
		 * @param {event} oEvent - the calling input's event
		 * @author Christophe Taymans
		 */
		Comp.prototype._handleValueSuggest = function (oEvent) {
			const sValue = oEvent.getParameter("suggestValue").trim();
			const oInput = oEvent.getSource();
			//const oSetting = this.setControlSettings(oInput);
			let oFilter = [];
			if (oInput.local) {
				MessageToast.show("'suggest' event must not been attached if using local values")
			} else {
				if (oInput.getListWithKey()) {
					oFilter.push(new Filter({
							path: 'key',
							operator: 'StartsWith',
							value1: sValue
						}),
						new Filter({
							path: 'value',
							operator: 'StartsWith',
							value1: sValue
						})
					);
				} else {
					oFilter.push(new Filter({
						path: 'value',
						operator: 'StartsWith',
						value1: sValue
					}));
				}
				var oSuggestionBinding = oInput.getBindingInfo("suggestionItems").binding;
				oSuggestionBinding.filter(oFilter, "Control");
			}
		};
		/**
		 * on Suggest Value Selected
		 * @method _handleSuggestValueSelected
		 * @private	
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	 
		 * @param {event} oEvent - the calling input's event
		 * @author Christophe Taymans
		 */
		Comp.prototype._handleSuggestValueSelected = function (oEvent) {
			const sSelecteditem = oEvent.getParameter("selectedItem");
			if (sSelecteditem) {
				const oInput = oEvent.getSource();
				oInput.setSelectedKey(sSelecteditem.getKey());
				oInput.setValue(sSelecteditem.getText());
				//const oSetting = this.setControlSettings(oInput);
				this.fireItemSelected({
					control: oInput,
					selectedItem: {
						key: sSelecteditem.getKey(),
						value: sSelecteditem.getText()
					}
				});
			}
		};
		/** check value
		 * @method _checkValue
		 * @private	
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	 
		 * @param {event} oEvent - the calling input's event
		 * @author Christophe Taymans
		 */
		Comp.prototype._checkValue = function (oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			//const oSetting = this.setControlSettings(oInput);
			oInput.setValueState("None");
			if (!sValue) {
				oInput.setSelectedKey(undefined);
				this.fireItemSelected({
					control: oInput,
					//setting: oSetting,
					selectedItem: {
						key: undefined,
						value: undefined
					}
				});
				return;
			}
			let oFilter, sKey
			oFilter = Merge([], oInput.filter);
			switch (oInput.getDisplayMode()) {
				case "key":

					oFilter.push(new Filter({
						path: 'key',
						operator: 'EQ',
						value1: sValue
					}));

					break;
				case "value":
					oFilter.push(new Filter({
						path: 'value',
						operator: 'EQ',
						value1: sValue
					}));
					break;
				default:
					const aValue = sValue.split(" ");
					if (aValue[0]) {
						sKey = aValue[0];
						oFilter.push(new Filter({
							path: 'key',
							operator: 'EQ',
							value1: sKey
						}));
					}
					break;
			}
			if (oInput.local) {
				const oSelected = this.listData.getData()[oInput.getSearchHelpId()].find(function (data) {
					switch (oInput.getDisplayMode()) {
						case "key":
							return data.key === sKey
						case "value":
							return data.value === sValue
						default:
							return data.key === sKey
					}
				});
				if (oSelected) {
					if (oInput.getSelectedKey() != oSelected.key) {
						oInput.setSelectedKey(oSelected.key);
						switch (oInput.getDisplayMode()) {
							case "key":
								oInput.setValue(oSelected.key);
								break;
							case "value":
								oInput.setValue(oSelected.value);
								break;
							default:
								oInput.setValue(oSelected.key + " " + oSelected.value);
								break;
						}
						this.fireItemSelected({
							control: oInput,
							//setting: oSetting,
							selectedItem: {
								key: oSelected.key,
								value: oSelected.value
							}
						});
					}
				} else {
					oInput.setValueState("Error");
				}
			} else {
				this.getModel("main").read('/SearchHelpValueSet', {
					filters: oFilter,
					success: function (oData) {
						if (oData.results.length) {
							if (oInput.getSelectedKey() != oData.results[0].key) {
								oInput.setSelectedKey(oData.results[0].key);
								switch (oInput.getDisplayMode()) {
									case "key":
										oInput.setValue(oData.results[0].key);
										break;
									case "value":
										oInput.setValue(oData.results[0].value);
										break;
									default:
										oInput.setValue(oData.results[0].key + " " + oData.results[0].value);
										break;
								}
								this.fireItemSelected({
									control: oInput,
									//setting: oSetting,
									selectedItem: {
										key: oData.results[0].key,
										value: oData.results[0].value
									}
								});
							}
						} else {
							oInput.setValueState("Error");
						};
					}.bind(this)
				});
			}
		};
		//=============================================================================
		// PRIVATE METHODS
		//=============================================================================	
		/**
		 * read the requested local search helps from the backend	
		 * and returns a JSONmodel 
		 * @method 		_loadLocalData
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	
		 * @private
		 */
		Comp.prototype._loadLocalData = function () {
			if (!this.getSearchHelpToLoad().length) {
				this.fireDataLoaded({
					data: {}
				});
				return;
			}
			const oFilter = [new Filter({
				path: 'appId',
				operator: 'EQ',
				value1: this.getProperty("appId")
			})].concat(
				this.getSearchHelpToLoad().map(function (sSearchHelpId) {
					return new Filter({
						path: "searchHelpId",
						operator: 'EQ',
						value1: sSearchHelpId
					});
				}));
			this.getModel("main").read("/SearchHelpValueSet", {
				filters: oFilter,
				success: function (data) {
					//group the result by searchhelpid and store it in list Data property
					this.listData = this._groupBySearchHelpId(data.results);
					this.setModel(this.listData, "valueList");
					// fire event with the result in a JSON model
					this.fireDataLoaded({
						data: this.listData
					});
					this.fnResolve(this.listData); //release the global loading promise
				}.bind(this),
				error: function (error) {
					this.fireDataError({
						error: error
					});
				}.bind(this)
			});
		};

		/**
		 * build settings Vs input parameter
		 * @method buildSettings
		 * @public
		 * @instance
		 * @param {object} oInput the input parameters
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.buildSettings = function (oSetting) {
			let oFilter = [];
			if (this.getSearchHelpToLoad().some(function (row) {
					return row === oSetting.searchHelpId;
				}.bind(this))) {
				oSetting.local = true;
				oSetting.path = "/" + oSetting.searchHelpId;
			} else {
				oFilter = [new Filter({
						path: 'appId',
						operator: 'EQ',
						value1: this.getProperty("appId")
					}),
					new Filter({
						path: 'searchHelpId',
						operator: 'EQ',
						value1: oSetting.searchHelpId
					})
				];
				oSetting.local = false;
				oSetting.path = "/SearchHelpValueSet";

				if (oSetting.dependencyKey) {
					oFilter.push(new Filter({
						path: 'dependencyKey',
						operator: 'EQ',
						value1: oInput.getDependencyKey()
					}));
				}
				if (oInput.oSetting.dependencyKey) {
					oFilter.push(new Filter({
						path: 'dependencyField',
						operator: 'EQ',
						value1: oSetting.dependencyField
					}));
				}
			}
			oSetting.filter = oFilter;
			if (oSetting.listWithKey) {
				oSetting.template = new SuggestionItem({
					key: "{key}",
					text: "{key} {value}"
				});
				oSetting.sorter = new Sorter("key");

			} else {
				oSetting.template = new SuggestionItem({
					key: "{key}",
					text: "{value}"
				});
				oInput.sorter = new Sorter("value");
			}
			return oSetting;
		};
		/**
		 * build input settings Vs input property
		 * @method setControlSettings
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oInput the calling input
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.setControlSettings = function (oInput) {
			let oFilter = [];
			if (this.getSearchHelpToLoad().some(function (row) {
					return row === oInput.getSearchHelpId();
				}.bind(this))) {
				oInput.local = true;
				oInput.path = "/" + oInput.getSearchHelpId();
			} else {
				oFilter = [new Filter({
						path: 'appId',
						operator: 'EQ',
						value1: this.getProperty("appId")
					}),
					new Filter({
						path: 'searchHelpId',
						operator: 'EQ',
						value1: oInput.getSearchHelpId()
					})
				];
				oInput.local = false;
				oInput.path = "/SearchHelpValueSet";
				if (oInput instanceof be.infrabel.reuse.cross.genericsearch.Input) {
					if (oInput.getDependencyKey()) {
						oFilter.push(new Filter({
							path: 'dependencyKey',
							operator: 'EQ',
							value1: oInput.getDependencyKey()
						}));
					}
					if (oInput.getDependencyField()) {
						oFilter.push(new Filter({
							path: 'dependencyField',
							operator: 'EQ',
							value1: oInput.getDependencyField()
						}));
					}
				}
			}
			oInput.filter = oFilter;
			switch (oInput.getDisplayMode()) {
				case "key":
					oInput.template = new SuggestionItem({
						key: "{key}",
						text: "{key}"
					});
					if (!oInput.getSorter()) {
						oInput.setSorter(new Sorter("key"));
					}
					break;
				case "value":
					oInput.template = new SuggestionItem({
						key: "{key}",
						text: "{value}"
					});
					if (!oInput.getSorter()) {
						oInput.setSorter(new Sorter("value"));
					}
					break;
				default:
					oInput.template = new SuggestionItem({
						key: "{key}",
						text: "{key} {value}"
					});
					if (!oInput.getSorter()) {
						oInput.setSorter(new Sorter("key"));
					}
					break;
			}
		};
		/**
		 * get dependency field description
		 * @method getDependencyFieldDescription
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oInput the calling input	
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.getDependencyFieldDescription = function (oInput) {
			if (oInput.getDependencyField() && !oInput.getDependencyFieldDescription()) {
				const oModel = this.getModel("main");
				oInput.setBusy(true);
				oModel.metadataLoaded().then(function () {
					oModel.read(oModel.createKey("/DependencyInfoSet", {
						appId: this.getAppId(),
						searchHelpId: oInput.getSearchHelpId(),
						dependencyField: oInput.getDependencyField()
					}), {
						success: function (oData) {
							oInput.setBusy(false);
							oInput.setDependencyFieldDescription(oData.longDescription);
							this.buildTitleVsDependency(oInput);
						}.bind(this),
						error: function () {
							oInput.setBusy(false);
						}
					});
				}.bind(this));
			}
		};
		/**
		 * build search title vs dependency field description
		 * @method buildTitleVsDependency
		 * @public
		 * @instance
		 * @param {sap.ui.base.Event} oInput the calling input
		 * @memberof be.infrabel.reuse.cross.genericsearch.Component
		 * @author Christophe Taymans
		 **/
		Comp.prototype.buildTitleVsDependency = function (oInput) {
			if (oInput.getDependencyFieldDescription() && oInput.getDependencyKey()) {
				oInput.title = oInput.getSearchTitle() + " (" + oInput.getDependencyFieldDescription() + " : " + oInput.getDependencyKey() + ")";
			} else {
				oInput.title = oInput.getSearchTitle()
			}
		};
		/**
		 * Create a JSONModel with the key-values grouped by searchhelpid.
		 * =>group per values per search help id
		 * @method 		_groupBySearchHelpId
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	
		 * @param 		{Array} searchHelpsFromSap - The array of search helps with data to group by searchHelpId
		 * @returns		{JSONModel}	resultData  JSONModel of group per values per search help id
		 * @private
		 */
		Comp.prototype._groupBySearchHelpId = function (searchHelpsFromSap) {
			const resultObject = searchHelpsFromSap.reduce(function (
					searchHelpObject,
					currentSearchHelp
				) {
					//add new searchhelp with key-value as array
					if (!searchHelpObject[currentSearchHelp.searchHelpId]) {
						searchHelpObject[currentSearchHelp.searchHelpId] = [{
							key: currentSearchHelp.key,
							value: currentSearchHelp.value
						}]
					} else {
						//add the key-value to the searchhelp
						searchHelpObject[currentSearchHelp.searchHelpId].push({
							key: currentSearchHelp.key,
							value: currentSearchHelp.value
						});
					}
					return searchHelpObject;
				},
				// first one is empty
				{});
			return new JSONModel(resultObject);
		};
		/**
		 * get Value Help Dialog fragment
		 * @method getValueHelpDialog
		 * @private
		 * @instance
		 * @returns {promise} - the promise	
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	 
		 * @author Christophe Taymans
		 **/
		Comp.prototype._getValueHelpDialog = function () {
			return new Promise(function (resolve) {
				if (!this.valueHelpDialog) {
					Fragment.load({
						name: "be.infrabel.reuse.cross.genericsearch.ValueHelp",
						controller: this
					}).then(function (oFragment) {
						this.valueHelpDialog = oFragment;
						resolve(oFragment);
					}.bind(this));
				} else {
					resolve(this.valueHelpDialog);
				}
			}.bind(this));
		};
		/**
		 * handle search Help closing
		 * @method onValueHelpClose 
		 * @private
		 * @instance
		 * @memberof be.infrabel.reuse.cross.genericsearch.Component
		 * @param {caller} oEvent - the calling event
		 * @author Christophe Taymans
		 **/
		Comp.prototype._onValueHelpClose = function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) {
				return;
			}
			var oSelectedData = oSelectedItem.getBindingContext().getObject();
			var oInput = this.callerInput;
			if (oInput) {
				oInput.setValueState("None");
				if (oSelectedItem) {
					oInput.setSelectedKey(oSelectedData.key);
					const oCallerModel = oInput.getBindingInfo("selectedKey").binding.getModel();
					const oCallerContext = oInput.getBindingInfo("selectedKey").binding.getContext();
					oCallerModel.setProperty(oInput.getBindingInfo("selectedKey").binding.getPath(), oSelectedData.key, oCallerContext);

					switch (oInput.getDisplayMode()) {
						case "key":
							oInput.setValue(oSelectedData.key);
							break;
						case "value":
							oInput.setValue(oSelectedData.value);
							break;
						default:
							oInput.setValue(oSelectedData.key + " " + oSelectedData.value);
							break;
					}
				}
			}
			// raise event for the caller
			this.fireItemSelected({
				control: oInput,
				selectedItem: {
					key: oSelectedData.key,
					value: oSelectedData.value
				}
			});
		};
		/**
		 * on value Search
		 * @method on value Search
		 * @privae
		 * @memberof be.infrabel.reuse.cross.genericsearch.Component	 
		 * @param {event} oEvent - the calling event
		 * @author Christophe Taymans
		 */
		Comp.prototype._onValueSearch = function (oEvent) {
			let oSetting;
			const sValue = oEvent.getParameter("value");
			var oInput = this.callerInput;
			//const oSetting = this.getValueHelpSetting();
            if (oInput instanceof ReuseInput){
			oSetting = {
				local:  oInput.local,
			    listWithKey: oInput.getListWithKey()
			};
		} else {
			oSetting = oInput;
		}

			let oFilter;
			if (oSetting.local) {
				let aFilter = [
					new Filter("value", sap.ui.model.FilterOperator.Contains, sValue)
				];
				if (oSetting.listWithKey) {
					aFilter.push(new Filter("key", sap.ui.model.FilterOperator.Contains, sValue));
				}
				oFilter = new Filter({
					filters: aFilter,
					and: false
				});
			} else {
				oFilter = [
					new Filter("value", sap.ui.model.FilterOperator.Contains, sValue)
				];
				if (oSetting.listWithKey) {
					oFilter.push(new Filter("key", sap.ui.model.FilterOperator.Contains, sValue));
				}
			}
			const oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilter, "Control");
		};
		/**
		 * Getter for i18n ressource
		 *
		 * @method		getText
		 * @author		Christophe Taymans
		 * @memberof	be.infrabel.reuse.cross.genericsearch.Component	
		 * @param {string} fTextId the text name in the bundle
		 * @param {string} fArgs arguments for the text
		 * @returns {string} the text
		 */
		Comp.prototype.getText = function (fTextId, fArgs) {
			return this.getModel("i18n").getResourceBundle().getText(fTextId, fArgs);
		};
		return Comp;
	});
