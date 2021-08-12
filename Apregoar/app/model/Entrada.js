Ext.define('Apregoar.model.Entrada', {
    extend: 'Ext.data.Model',
    idProperty: 'entradaId',

    schema:{
        namespace: 'Apregoar.model',

    },

    fields: [
        'authorName',
        {name: 'entradaId', type: 'int'},
        'placeDesc',
        'placeName',
        {name: 'publishDate', type: 'date', format: 'Y-m-d'},
        'sectionName',
        'stypeName',
        'summary',
        {name: 'tBegin', type: 'date', format: 'Y-m-d'},
        'tDesc',
        {name: 'tEnd', type: 'date', format: 'Y-m-d'},
        'themeName',
        'title',
        'webLink',
        'publisherName'
        // geom
        //'load_id', //unnecessary for user views
        
        
    ],
});
// No validators here: should only validate on input probably
    //validators: {
    //    title: {type: 'length', min: 4},
    //    weblink: 'presence' //WISHLIST @^(https?|ftp)://[^\s/$.?#].[^\s]*$@iS (from https://mathiasbynens.be/demo/url-regex, @stephenhay)
    //}