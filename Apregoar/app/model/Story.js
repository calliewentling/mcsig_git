Ext.define('Apregoar.model.Story', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'title', type: 'string'},
        {name: 'summary', type: 'string'},
        {name: 'webLink', type: 'string'},
        {name: 'publishDate', type: 'date'},
        {name: 'storyId', type: 'int'}
    ]
}); 