//https://docs.sencha.com/extjs/6.2.0/guides/backend_connectors/direct/mysql_php.html

Ext.define('Apregoar.store.EntradaTest', {
    extend: 'Ext.data.Store',
    alias: 'store.entradastest',

    fields: [
        'authorName', 'entraId', 'placeDesc', 'placeName', 'publishDate', 'sectionName', 'stypeName', 'summary', 'tBegin', 'tDesc', 'tEnd', 'themeName', 'title', 'webLink', 'publisherName'
    ],

    proxy: {
        type: 'direct',
        directFn: "QueryEntradas.getResults"
    },

    autoLoad: true
})