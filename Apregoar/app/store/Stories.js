Ext.define('Apregoar.store.Stories', {
    extend: 'Ext.data.Store',
    model: 'Apregoar.model.Story',

    alias: 'store.stories',

    fields: [
        'title',
        'summary',
        'webLink',
        'publishDate',
        'storyId'
    ],

    proxy: {
        type: 'direct',
        directFn: "QueryStories.getResults"
    },

    autoLoad: true
 });