Ext.define('Apregoar.store.Instances', {
    extend: 'Ext.data.Store',
    model: 'Apregoar.model.Instance',

    alias: 'store.instances',

    fields: [
        'storyId',
        'tBegin',
        'tEnd',
        'tType',
        'tDesc',
        'placeID',
        'instanceID'
    ],

    proxy: {
        type: 'direct',
        directFn: "QueryInstances.getResults"
    },

    autoLoad: true
 });