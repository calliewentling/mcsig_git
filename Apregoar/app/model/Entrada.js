Ext.define('Apregoar.model.Entrada', {
    extend: 'Ext.data.Model',
    idProperty: 'entradaId',

    schema:{
        namespace: 'Apregoar.model'
    },

    fields: [
        {name: 'entradaId', type: 'int'},
        'title',
        'summary',
        'webLink',
        {name: 'tBegin', type: 'date'},
        {name: 'tEnd', type: 'date'},
        'tDesc',
        'placeName',
        'placeDesc',
        // geom
        'sectionName',
        'themeName',
        'stypeName',
        {name: 'publishDate', type: 'date'},
        //'load_id', //unnecessary for user views
        'authorName',
        'publisherName'
    ],
});



// No validators here: should only validate on input probably
    //validators: {
    //    title: {type: 'length', min: 4},
    //    weblink: 'presence' //WISHLIST @^(https?|ftp)://[^\s/$.?#].[^\s]*$@iS (from https://mathiasbynens.be/demo/url-regex, @stephenhay)
    //}