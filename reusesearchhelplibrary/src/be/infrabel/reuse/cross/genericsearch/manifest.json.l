{
	"_version": "1.9.0",
	"sap.app": {
		"id": "be.infrabel.reuse.cross.genericsearch",
		"type": "component",
		"embeddedBy": "../",
		"i18n": "i18n/i18n.properties",
		"title": "{{compTitle}}",
		"description": "{{compDescription}}",
		"resources": "resources.json",
		"applicationVersion": {
			"version": "1.0.0"
		},
		"dataSources": {
			"main": {
				"uri": "http://sapfid.msnet.railb.be:8002/sap/opu/odata/sap/ZCA_GENERIC_SEARCH_HELP_SRV/?&saml2=disabled",
				"type": "OData",
				"settings": {
					"odataVersion": "2.0"
				}
			}
		}
	},
	"sap.ui": {
		"technology": "UI5",
		"icons": {
			"icon": "",
			"favIcon": "",
			"phone": "",
			"phone@2": "",
			"tablet": "",
			"tablet@2": ""
		},
		"deviceTypes": {
			"desktop": true,
			"tablet": true,
			"phone": true
		},
		"supportedThemes": ["base", "sap_hcb", "sap_belize", "sap_belize_plus"]
	},
	"sap.ui5": {
		"componentName": "be.infrabel.reuse.cross.genericsearch",
		"dependencies": {
			"minUI5Version": "1.52.0",
			"libs": {
				"sap.ui.core": {},
				"sap.m": {}
			},
			"components": {}
		},
		"contentDensities": {
			"compact": true,
			"cozy": true
		},
		"handleValidation": true,
		"models": {
			"main": {
				"dataSource": "main",
				"settings": {
					"defaultBindingMode": "TwoWay",				
					"defaultCountMode": "Inline",
					"json": true,
					"useBatch": true
				}
			},
			"i18n": {
				"type": "sap.ui.model.resource.ResourceModel",
				"settings": {
					"bundleName": "be.infrabel.reuse.cross.genericsearch.i18n.i18n"
				}
			}
		},
		"resources": {
			"css": [],
			"js": []
		}
	}
}
