
Ext.define("Apregoar.view.main.Map",{
    //extend: 'Ext.panel.Panel',
    extend: "GeoExt.component.Map",
    xtype: 'mappanel',
    requires: [
        "Apregoar.view.main.MapController",
        "Apregoar.view.main.MapModel"
    ],

    controller: "main-map",
    viewModel: {
        type: "main-map"
    },

    //html: 'Hello, World!!'
    map: new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            }),
            new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: 'terrain-labels'
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat( [-8.751278, 40.611368] ),
            zoom: 12
        })
    })
});
