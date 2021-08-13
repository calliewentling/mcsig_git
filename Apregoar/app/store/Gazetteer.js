Ext.define('Apregoar.store.Gazetteer', {
    extend: 'Ext.data.Store',
    model: 'Apregoar.model.Place',

    alias: 'store.gazetteer',

    fields: [
        'placeName',
        'placeDesc',
        'geom',
        'placeId'
    ],

    proxy: {
        type: 'direct',
        directFn: "QueryGazetteer.getResults"
    },

    autoLoad: true
 });