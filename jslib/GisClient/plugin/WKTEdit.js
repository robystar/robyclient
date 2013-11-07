Ext.define('GisClient.plugins.WKTEdit', {

    mixins: {
        observable: 'Ext.util.Observable'
    },
	
    alias : 'plugin.gc_wktedit',
    alternateClassName : 'GisClient.WKTEdit',
	
	constructor: function(config) {
        config = config || {};

        Ext.apply(this, config);
        this.initialConfig = config;

        this.callParent(arguments);
    },

	labelText: 'Info: ',
	resultLayer:null,
	selectControl:null,
	resultTemplate:{},
	popupList:{},
	info:[],

    init: function(mapPanel){
		//Se ho i controlli di selezione regstro l'evento selected di ogni controllo
		var info,proj,geom,lon,lat,zoom;
		this.mapPanel=mapPanel;

		var vectorLayer = new OpenLayers.Layer.Vector("gcWKTEditTools", {displayInLayerSwitcher:false});	
		mapPanel.map.addLayer(vectorLayer);	
		this.modifyControl = new OpenLayers.Control.ModifyFeature(vectorLayer);
		mapPanel.map.addControl(this.modifyControl);
		
		info = this.confElement && this.confElement.value && this.confElement.value.split(';');
		if(info && info.length == 5){
			proj = info[0];
			geom = info[1];
			lon = parseFloat(info[2]);
			lat = parseFloat(info[3]);
			zoom = parseInt(info[4]);
			this.info = info;
		};
		// TODO USARE TRANSFORM QUANDO SRID GEOM <> SRID MAPPA
		//Posizione:
		if(lon && lat) mapPanel.center = new OpenLayers.LonLat(lon,lat);
		if(zoom) mapPanel.zoom = zoom;
		if(geom){		
			var format = new OpenLayers.Format.WKT();
			var feature = format.read(geom);
			if (feature){
				vectorLayer.addFeatures([feature]);
				this.modifyControl.selectFeature(feature);
			}
		};

		vectorLayer.events.register("featureadded", this, this.updateWKTGeometry);
		vectorLayer.events.register("featuremodified", this, this.updateWKTGeometry);
		vectorLayer.events.register("beforefeaturesadded", vectorLayer, function(evt) {
			this.destroyFeatures();
		});
		mapPanel.map.events.register("moveend", this, this.updatePosition);

		var items = [];
	
		if(this.point){
			var drawPointControl = new OpenLayers.Control.DrawFeature(
				vectorLayer,
				OpenLayers.Handler.Point
			);
			items.push(	new GeoExt.Action({
								control: drawPointControl,
								text: "Punto",
								iconCls: 'add-feature',  // <-- icon
								toggleGroup: 'mapToolbar'
			}));	
			mapPanel.map.addControl(drawPointControl);
		};
		
		
		if(this.line){
		
			var drawLineControl = new OpenLayers.Control.DrawFeature(
				vectorLayer,
				OpenLayers.Handler.Path
			);
			if(items.length > 0) items.push(" ","-"," ");
			items.push(	new GeoExt.Action({
								control: drawLineControl,
								text: "Linea",
								iconCls: 'add-feature',  // <-- icon
								toggleGroup: 'mapToolbar'
			}));
			mapPanel.map.addControl(drawLineControl);
		};
		
		
		if(this.polygon){

			var drawPolygonControl = new OpenLayers.Control.DrawFeature(
				vectorLayer,
				OpenLayers.Handler.Polygon
			);
			if(items.length > 0) items.push(" ","-"," ");

			items.push(new GeoExt.Action({
								control: drawPolygonControl,
								text: "Poligono",
								iconCls: 'add-feature',  // <-- icon
								toggleGroup: 'mapToolbar'
			}));
			mapPanel.map.addControl(drawPolygonControl);
		};

		if(items.length>0){
			var list = ["->",'Inserisci: '];
			items = list.concat(items);
			mapPanel.getTopToolbar().add(items);
		};
		
    },
	
	updateWKTGeometry: function(evt) {
		if (this.confElement){
			if(evt.feature.renderIntent == 'default') this.modifyControl.selectFeature(evt.feature);
			var format = new OpenLayers.Format.WKT();
			this.info[0] = evt.object.projection.projCode;
			this.info[1] = format.write(evt.feature);
			this.confElement.value = this.info.join(";");
			format.destroy();
		}
    },

	updatePosition: function(evt) {
		if (this.confElement){
			this.info[3] = evt.object.center.lat;
			this.info[2] = evt.object.center.lon;
			this.info[4] = evt.object.zoom;
			this.confElement.value = this.info.join(";");
		}
    }


});

	