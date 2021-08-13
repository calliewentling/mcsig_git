Ext.define('Apregoar.model.Instance', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'storyId', type: 'int'},
        {name: 'tBegin', type: 'date'},
        {name: 'tEnd', type: 'date'},
        {name: 'tType', type: 'string'},
        {name: 'tDesc', type: 'string'},
        {name: 'placeID', type: 'int'},
        {name: 'instanceId', type: 'int'}
    ]
}); 