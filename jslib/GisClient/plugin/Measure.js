Ext.define('GisClient.plugin.Measure', {
	requires: ['Ext.toolbar.Spacer', 'Ext.button.Split'],
    mixins: {
        observable: 'Ext.util.Observable'
    },
	
    alias : 'plugin.gc_measure',
    alternateClassName : 'GisClient.Measure',

	label: 'Misura: ',
	lengthText: 'Lunghezza',
	areaText: 'Area',
	toggleGroup: 'nav',
	
	constructor: function(config) {
        config = config || {};

        Ext.apply(this, config);
        this.initialConfig = config;

        this.callParent(arguments);
    },

    /** private: method[init]
     *  :param tree: ``Ext.tree.TreePanel`` The tree.
     */
    init: function(mapPanel) {

		this.mapPanel = mapPanel;
		var action;
		var actions = mapPanel.actions || {};
		actions['measure-length'] =  Ext.create('GeoExt.Action', {
			text: this.lengthText,
			iconCls: "icon-measure-length",
			toggleGroup: this.toggleGroup,
			group: this.toggleGroup,
			allowDepress: false,
			map: mapPanel.map,
			control: this.createMeasureControl(
				OpenLayers.Handler.Path, this.lengthText
			)
		});
		actions['measure-area'] =  Ext.create('GeoExt.Action', {					
			text: this.areaText,
			iconCls: "icon-measure-area",
			toggleGroup: this.toggleGroup,
			group: this.toggleGroup,
			allowDepress: false,
			map: mapPanel.map,
			control: this.createMeasureControl(
				OpenLayers.Handler.Polygon, this.areaText
			)
		});
		
		var activeIndex = 0;
		var measureSplit = Ext.create('Ext.button.Split', {
			iconCls: "icon-measure-length",
			//tooltip: "Measure",
			enableToggle: true,
			toggleGroup: this.toggleGroup, // Ext doesn't respect this, registered with ButtonToggleMgr below
			allowDepress: false, // Ext doesn't respect this, handler deals with it
			handler: function(button, event) {
				// allowDepress should deal with this first condition
				if(!button.pressed) {
					button.toggle();
				} else {
					button.menu.items.items[activeIndex].setChecked(true);
				}
			},
			listeners: {
				toggle: function(button, pressed) {
					// toggleGroup should handle this
					if(!pressed) {
						button.menu.items.each(function(i) {
							i.setChecked(false);
						});
					}
				}
			},
			menu: Ext.create('Ext.menu.Menu', {
				items: [
					Ext.create('Ext.menu.CheckItem', actions["measure_length"]),
					Ext.create('Ext.menu.CheckItem', actions["measure_area"])
				]
			})
		});
		measureSplit.menu.items.each(function(item, index) {
			item.on({checkchange: function(item, checked) {
				measureSplit.toggle(checked);
				if(checked) {
					activeIndex = index;
					measureSplit.setIconCls(item.iconCls);
				}
			}});
		});
		mapPanel.getDockedComponent('tbTop').add([" ","-"," ",measureSplit]);
		mapPanel.actions = actions;
    },
	
	createMeasureControl: function(handlerType, title) {

		var styleMap = new OpenLayers.StyleMap({
			"default": new OpenLayers.Style(null, {
				rules: [new OpenLayers.Rule({
					symbolizer: {
						"Point": {
							pointRadius: 4,
							graphicName: "square",
							fillColor: "white",
							fillOpacity: 1,
							strokeWidth: 1,
							strokeOpacity: 1,
							strokeColor: "#333333"
						},
						"Line": {
							strokeWidth: 3,
							strokeOpacity: 1,
							strokeColor: "#666666",
							strokeDashstyle: "dash"
						},
						"Polygon": {
							strokeWidth: 2,
							strokeOpacity: 1,
							strokeColor: "#666666",
							fillColor: "white",
							fillOpacity: 0.3
						}
					}
				})]
			})
		});
		var cleanup = function() {
			if (measureToolTip) {
				measureToolTip.destroy();
			}  
		};

		var makeString = function(metricData) {
			var metric = metricData.measure;
			var metricUnit = metricData.units;

			measureControl.displaySystem = "english";

			var englishData = metricData.geometry.CLASS_NAME.indexOf("LineString") > -1 ?
			measureControl.getBestLength(metricData.geometry) :
			measureControl.getBestArea(metricData.geometry);

			var english = englishData[0];
			var englishUnit = englishData[1];

			measureControl.displaySystem = "metric";
			var dim = metricData.order == 2 ?
			'<sup>2</sup>' :
			'';

			return metric.toFixed(2) + " " + metricUnit + dim + "<br>" +
				english.toFixed(2) + " " + englishUnit + dim;
		};

		var measureToolTip;
		var measureControl = new OpenLayers.Control.Measure(handlerType, {
			geodesic: true,
			persist: true,
			handlerOptions: {layerOptions: {styleMap: styleMap}},
			eventListeners: {
				measurepartial: function(event) {
					cleanup();
					measureToolTip = new Ext.ToolTip({
						xtype: 'tooltip',
						html: makeString(event),
						title: title,
						autoHide: false,
						closable: true,
						draggable: false,
						mouseOffset: [0, 0],
						showDelay: 1,
						listeners: {hide: cleanup}
					});
					if(event.measure > 0) {
						var px = measureControl.handler.lastUp;
						var p0 = this.getPosition();
						measureToolTip.targetXY = [p0[0] + px.x, p0[1] + px.y];
						measureToolTip.show();
					}
				},
				measure: function(event) {
					cleanup();
					measureToolTip = new Ext.ToolTip({
						xtype: 'tooltip',
						target: Ext.getBody(),
						html: makeString(event),
						title: title,
						autoHide: false,
						closable: true,
						draggable: false,
						mouseOffset: [0, 0],
						showDelay: 1,
						listeners: {
							hide: function() {
								measureControl.cancel();
								cleanup();
							}
						}
					});
				},
				deactivate: cleanup,
				scope: this.mapPanel
			}
		});

		return measureControl;
	}
	
});

	