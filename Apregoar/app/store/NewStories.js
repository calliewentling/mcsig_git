Ext.define('Apregoar.store.NewStories', {
    extend: 'Ext.data.Store',
    fields: ['title', 'summary', 'webLink', 'publishDate', 'storyId'],
    proxy: {
        type: 'ajax',
        api: {
            read: 'data/get_story',
            update: 'data/update_story'
        },
        reader: {
            type: 'json',
            root: 'stories'
        }
    }
})