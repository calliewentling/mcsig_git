/**
 * This view is an example list of people.
 */
Ext.define('Apregoar.view.main.List', {
    extend: 'Ext.grid.Panel',
    xtype: 'mainlist',

    requires: [
        'Apregoar.store.Personnel'
        //'Apregoar.store.EntradaEntries'
    ],

    title: 'Personnel',
    //title: 'Entradas',

    store: {
        type: 'personnel'
        //type: 'entradaEntry'
    },

    columns: [
        { text: 'Name',  dataIndex: 'name' },
        { text: 'Email', dataIndex: 'email', flex: 1 },
        { text: 'Phone', dataIndex: 'phone', flex: 1 }
        //{text: 'Title', dataIndex: 'title', flex: 1 },
        //{text: 'Author', dataIndex: 'authorName', flex: 1 }
    ],

    listeners: {
        select: 'onItemSelected'
    }
});
