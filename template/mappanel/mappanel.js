/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

Ext.require([
    'Ext.container.Viewport',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
    'Ext.window.MessageBox',
	'GeoExt.Action',
	'GeoExt.slider.Zoom',
    'GeoExt.slider.Tip',
    'GeoExt.panel.Map',
	'GisClient.plugin.Navigation',
	'GisClient.plugin.Measure',
	'GisClient.plugin.Coordinates',
	'GisClient.plugin.ScaleSelect',
	'GisClient.plugin.LoadingMessage',
	'GisClient.plugin.MapQuery',
	'GisClient.plugin.FeaturePopup',
	'GisClient.plugin.Redline'
]);

Ext.application({
    name: GisClient.mapset[0].name,
    launch: function() {

        var s = Ext.create('Ext.state.CookieProvider', {
            expires: new Date(new Date().getTime()+(1000*60*60*24*10)) //10 days
        });

	    Ext.state.Manager.setProvider(s);	
		
		console.log(s);
		var mapset = GisClient.mapset[0];
		//mapset.map.allOverlays = true;
		
        var map = new OpenLayers.Map(mapset.map);
		map.addControls([
			new OpenLayers.Control.ArgParser(),
			new OpenLayers.Control.Attribution(),
			new OpenLayers.Control.LoadingPanel(),
			new OpenLayers.Control.LayerSwitcher()
		]);
        
		var emptyBaseLayer = new OpenLayers.Layer.Image('BASE',Ext.BLANK_IMAGE_URL, map.maxExtent, new OpenLayers.Size(1,1),{"displayInLayerSwitcher":true,"isBaseLayer":true});
		map.addLayer(emptyBaseLayer);		
        map.addLayers(mapset.layers);

		if(mapset.baseLayerId){
			var lays = map.getLayersBy("gc_id",mapset.baseLayerId);
			if (lays.length > 0) map.setBaseLayer(lays[0]);
		}
		else
			map.setBaseLayer(emptyBaseLayer);
       
		var tipTemplate = '<div>Zoom Level: {0}</div><div>Resolution: {1}</div><div>Scale: 1 : {2}</div>';
		var minZoomLevel = map.getZoomForExtent(map.maxExtent);
        mappanel = Ext.create('GeoExt.panel.Map', {
            title: mapset.title,
			projectionDescription:mapset.projectionDescription,
            map: map,
            stateful: true,
            stateId: mapset.name,
//          extent: '12.87,52.35,13.96,52.66',

			items: [
					{
						xtype: "gx_zoomslider",
						vertical: true,
						aggressive: false,  
						height: 220,
						x: 10,
						y: 20,
						//minValue:12,
						plugins: Ext.create('GeoExt.slider.Tip', {
							getText: function(thumb) {
								var slider = thumb.slider;
								return Ext.String.format(tipTemplate, slider.getZoom(), slider.getResolution(), slider.getScale());
							}
						})					
					}
			],
			
			plugins:[
				{ptype:"gc_navigation"},
				{ptype:"gc_measure"},
				{ptype:"gc_scaleselect"},
				{ptype:"gc_coordinates"},
				{ptype:"gc_loadingmessage"},
				{ptype:"gc_mapquery"},
				{ptype:"gc_featurepopup"},
				{ptype:"gc_redline"}
			],

            dockedItems: [{
                xtype: 'toolbar',
				id:'tbTop',
                dock: 'top',
                items: []
            },
			{
                xtype: 'toolbar',
				id:'tbBottom',
                dock: 'bottom',
                items: []
            }]
        });

		
	/*	
		
	var resultPanel = Ext.create('GisClient.panel.DataView',{
		region: "east",
		title:'Risultati interrogazione',
		id: "toolPanel",
		collapsible: true,
		autoScroll: true,
		collapsed: false,// Ext.util.Cookies.get('gcDataPanelCollapsed'),
		iconCls:'queryresult',
		width: 350,
		max_features: 100,
		mapPanel: mappanel,
		
		tbar: {
			//xtype: 'container',
			//layout: 'anchor',
			//defaultType: 'toolbar',
			items:[{id:"tb-result",xtype:"tbtext",text:'',height:24}]// [{items: selectionToolbar(map, dataViewPanel)},{items:featureTools(map)}]
		},
		bbar: [],
		listeners:{
			collapse:function(p){
				Ext.util.Cookies.set('gcDataPanelCollapsed', p.collapsed);
			},
			expand:function(p){
				Ext.util.Cookies.set('gcDataPanelCollapsed', p.collapsed);
			}
		}
	})

	resultPanel.on('done',function(){
	
			Ext.select('div.myTool').on('click', function(e) {
			
			alert('');
	
			
			
		})
	
	});


	*/


		
		
		
		
		
		
		
		
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                mappanel
            ]
        });
		
    }
});
