Ext.define('GisClient.plugin.Coordinates', {

	coordsLabel: '',
	projLabel: 'PROIEZIONE: ',
	lonText:'X: ',
	latText:'Y: ',
	coordPrecision:3,

	requires :'Ext.toolbar.TextItem',
		
    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias : 'plugin.gc_coordinates',
    alternateClassName : 'GisClient.Coordinates',
	
	constructor: function(config) {
        config = config || {};

        Ext.apply(this, config);
        this.initialConfig = config;

        this.callParent(arguments);
    },

    init: function(mapPanel){

		var map = mapPanel.map;   
	
		var onMouseMove = function(e) {
			var lonLat = map.getLonLatFromPixel(e.xy);
			if (!lonLat) {
				return;
			}
			if (map.displayProjection) {
				lonLat.transform(map.getProjectionObject(), map.displayProjection);
			}
			Ext.getCmp("x-coord").setText(this.lonText + lonLat.lon.toFixed(this.coordPrecision));
			Ext.getCmp("y-coord").setText(this.latText + lonLat.lat.toFixed(this.coordPrecision));
		};
		map.events.register("mousemove", this, onMouseMove);
		
		var items = [
				{
					text: this.coordsLabel,
					xtype: "tbtext"
				},
				{
					id: 'x-coord',
					text: this.lonText,
					width: 100,
					xtype: "tbtext"
				},
				{
					id: 'y-coord',
					text: this.latText,
					width: 100,
					xtype: "tbtext"
				}
				/*
				{
					id: 'bbar_measure',
					text: "",
					width: 200,
					xtype: "tbtext"
				}
				*/
			];
			
			if(mapPanel.projectionDescription)
				items.push('->',
					{
						id: 'proj-desc',
						text: this.projLabel + mapPanel.projectionDescription,
						xtype: "tbtext"
					});
			
		
		mapPanel.getDockedComponent('tbBottom').add(items);

    }
	
});

	