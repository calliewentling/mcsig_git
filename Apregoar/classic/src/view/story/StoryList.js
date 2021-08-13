/**
 * This view is an example list of people.
 */
Ext.define('Apregoar.view.story.StoryList', {
    extend: 'Ext.grid.Panel',
    xtype: 'storylist',

    requires: [
        'Apregoar.store.Stories'
    ],

    title: 'View Headlines',

    store: {
        type: 'stories'
    },

    columns: [
        {text: 'Title', dataIndex: 'title', flex: 1 },
        {text: 'Link', dataIndex: 'webLink', flex: 1 }
    ],

    listeners: {
        select: 'onItemSelected'
    }
});
