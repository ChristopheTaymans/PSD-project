sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (BaseObject) {
	"use strict";
	let aValueHelpComponentBuffer = [];
	let aLoadingPromise = [];
	/**
	 * Constructor for dynamicsearch help data reusable component. 
	 *	
	 * @name    	be.infrabel.reuse.cross.genericsearch.Helper
	 * @alias   	be.infrabel.reuse.cross.genericsearch.Helper
	 * @author  	Christophe Taymans
	 * @license 	Infrabel Private
	 * @extends 	sap.ui.base.ManagedObject
	 * @constructor
	 * @public
	 */
	const oHelper = BaseObject.extend("be.infrabel.reuse.cross.genericsearch.Helper", /** @lends be.infrabel.reuse.cross.genericsearch.Helper*/ {
		metadata: {
			properties: {
				compId: {
					type: "string"
				},
				appId: {
					type: "string"
				},
				listToLoad: {
					type: "array"
				}
			}
		}
	});
	/**
	 * initializatio of the reusable compoent.
	 *
	 * @method		start
	 * @author		Christophe Taymans
	 * @memberof	be.infrabel.reuse.cross.genericsearch.Helper
	 * @returns     {promide} - the promise
	 * @public
	 */
	oHelper.prototype.start = function () {
		//BaseObject.prototype.init.apply(this, arguments);
		const oSetting = {
			compId: this.getCompId(),
			appId: this.getAppId(),
			listToLoad: this.getListToLoad()
		};
		return new Promise(function (resolve, reject) {
			// is component with compId already exist ?
			const oComponent = aValueHelpComponentBuffer.find(function (row) {
				return row.compId === oSetting.compId;
			})
			if (oComponent) {
				// it already exist 
				resolve(oComponent);
			} else {
				var that = this;
				this.fnResolve;	
				aLoadingPromise.push({			
					compId: oSetting.compId,						
					pLoaded : new Promise(function(resolve) {
						that.fnResolve = resolve;
					})});
				// it does not exist yes --> create it
				sap.ui.component({
					name: "be.infrabel.reuse.cross.genericsearch",
					async: true,
					manifestFirst: true,
					componentData: oSetting
				}).then(function (oComponent) {
					// store new component in static array
					aValueHelpComponentBuffer.push({			
						compId: oSetting.compId,
						component: oComponent
					});
					oComponent.attachDataLoaded(
						function () {
							resolve(oComponent);
						}.bind(this)
					);
					//component is loaded but error on odata so here should the DataError event be attached
					oComponent.attachDataError(
						function (oError) {
							reject(oError);
						}.bind(this)
					);
					this.fnResolve(oComponent);
				}.bind(this));
			}
		}.bind(this));
	};
	/**
	 * deregister value help component from buffer
	 *
	 * @method		deregister
	 * @author		Christophe Taymans
	 * @memberof	be.infrabel.reuse.cross.genericsearch.Helper
	 * @returns     {promide} - the promise
	 * @public
	 */
	oHelper.prototype.deregister = function (oComponent) {
		let iIndex = aValueHelpComponentBuffer.findIndex(function (row) {
			return row.compId === oComponent.getCompId();
		})
		if (iIndex >= 0 ) {
			aValueHelpComponentBuffer.splice(iIndex, 1);
		}
		iIndex = aLoadingPromise.findIndex(function (row) {
			return row.compId === oComponent.getCompId();
		})
		if (iIndex >= 0 ) {
			aLoadingPromise.splice(iIndex, 1);
		}
	};
	/**
	 * get the reusable component Vs comp Id
	 *
	 * @method		getComponent
	 * @author		Christophe Taymans
	 * @memberof	be.infrabel.reuse.cross.genericsearch.Helper
	 * @param       {string} compId the component id (optional)
	 * @returns     {component} - the component
	 * @public
	 */
	oHelper.prototype.getComponent = function (compId) {
		let oComponentBuffer;
		if (aValueHelpComponentBuffer && aValueHelpComponentBuffer.length) {
			oComponentBuffer = aValueHelpComponentBuffer.find(function (row) {
				return row.compId === compId;
			});
		}
		return oComponentBuffer ? oComponentBuffer.component : undefined;
	}
	/**
	 * get the reusable component Vs comp Id
	 *
	 * @method		isLoaded 
	 * @author		Christophe Taymans
	 * @memberof	be.infrabel.reuse.cross.genericsearch.Helper
	 * @param       {string} compId the compoenent id 
	 * @returns     {promise} - the loaded promise
	 * @public
	 */
	oHelper.prototype.isLoaded  = function (compId) {
		let oPromiseBuffer;
		if (aLoadingPromise  && aLoadingPromise .length) {
			oPromiseBuffer = aLoadingPromise .find(function (row) {
				return row.compId === compId;
			});
		}
		return oPromiseBuffer ? oPromiseBuffer.pLoaded : undefined;
	}	
	return oHelper;
});
