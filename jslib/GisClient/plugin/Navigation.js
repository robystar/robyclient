Ext.define('GisClient.plugin.Navigation', {
	requires: 'Ext.toolbar.Spacer',
    mixins: {
        observable: 'Ext.util.Observable'
    },
	
    alias : 'plugin.gc_navigation',
    alternateClassName : 'GisClient.Navigation',
	
	constructor: function(config) {
        config = config || {};

        Ext.apply(this, config);
        this.initialConfig = config;

        this.callParent(arguments);
    },

    init: function(mapPanel){
		var map = mapPanel.map;
		var ctrl, toolbarItems = [], action, actions = mapPanel.actions || {};

        action = Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
			iconCls: 'zoomfull',
            tooltip: "Zoom to full extent"
        });
        actions["full-extent"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push(" ","-"," ");
        
		action = Ext.create('GeoExt.Action', {
			control: new OpenLayers.Control.ZoomBox(),
			tooltip: 'Zoom in: click in the map or use the left mouse button and drag to create a rectangle',
			map: map,
			iconCls: 'zoomin',
			toggleGroup: "nav",
			checked:true
		});
        actions["zoom-in"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push(" ");
		
		action = Ext.create('GeoExt.Action', {
			control: new OpenLayers.Control.ZoomBox({
				out: true
			}),
			tooltip: 'Zoom out: click in the map or use the left mouse button and drag to create a rectangle',
			map: map,
			iconCls: 'zoomout',
			toggleGroup: "nav"
		});
        actions["zoom-out"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push(" ");
		
        action = Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.Navigation({autoActivate:false}),
            map: map,
			iconCls: 'pan',
			tooltip: 'Pan map: keep the left mouse button pressed and drag the map',
			toggleGroup: "nav"
        });
        actions["pan"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push(" ","-"," ");
        
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);
        
        action = Ext.create('GeoExt.Action', {
			tooltip: "Previous view",
			iconCls: 'back',
            control: ctrl.previous,
            disabled: true
        });
        actions["previous"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push(" ");
		
        action = Ext.create('GeoExt.Action', {
            tooltip: "Next view",
			iconCls: 'next',
            control: ctrl.next,
            disabled: true
        });
        actions["next"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));

		mapPanel.getDockedComponent('tbTop').add(toolbarItems);
		mapPanel.actions = actions;

    }
	
});

	