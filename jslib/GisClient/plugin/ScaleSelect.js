Ext.define('GisClient.plugin.ScaleSelect', {


	scaleLabel: 'Scale: ',

    mixins: {
        observable: 'Ext.util.Observable'
    },
	requires:[
	    'Ext.form.ComboBox',
		'GeoExt.data.ScaleStore'
	],
    alias : 'plugin.gc_scaleselect',
    alternateClassName : 'GisClient.ScaleSelect',
	
	constructor: function(config) {
        config = config || {};

        Ext.apply(this, config);
        this.initialConfig = config;

        this.callParent(arguments);
    },

    init: function(mapPanel){

		var map = mapPanel.map;
 	    var scaleStore = Ext.create("GeoExt.data.ScaleStore", {map: map});
        var zoomSelector = Ext.create("Ext.form.ComboBox", {
            store: scaleStore,
            emptyText: "Zoom Level",
            listConfig: {
                getInnerTpl: function() {
                    return "1: {scale:round(0)}";
                }
            },
            editable: true,
            triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
            queryMode: 'local' // keep the combo box from forcing a lot of unneeded data refreshes
        });

        zoomSelector.on('select', 
            function(combo, record, index) {
                map.zoomTo(record[0].get("level"));
            },
            this
        );     
		
        map.events.register('zoomend', this, function() {
            var scale = scaleStore.queryBy(function(record){
                return this.map.getZoom() == record.data.level;
            });

            if (scale.length > 0) {
                scale = scale.items[0];
                zoomSelector.setValue("1 : " + parseInt(scale.data.scale));
            } else {
                if (!zoomSelector.rendered) return;
                zoomSelector.clearValue();
            }
        });

		var items = [
				{
					text: this.scaleLabel,
					xtype: "tbtext"
				},
				zoomSelector
			];
			
		mapPanel.getDockedComponent('tbBottom').add(items);

    }
	
});

	