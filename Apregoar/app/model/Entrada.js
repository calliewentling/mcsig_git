Ext.define('Apregoar.model.Entrada', {
    extend: 'Ext.data.Model',
    idProperty: 'entrada_id',

    schema:{
        namespace: 'Apregoar.model'
        //proxy: {
        //    type: 'ajax',
        //    api: {
        //        read: 'WHAT GOES HERE' // what is my relevant URL??
        //    },
        //    reader: {
        //        type: 'json',
        //        rootProperty:'data'
        //    }
        //}
    },

    fields: [
        {name: 'entrada_id', type: 'int'},
        'title',
        'summary',
        'web_link',
        {name: 't_begin', type: 'date'},
        {name: 't_end', type: 'date'},
        't_desc',
        'place_name',
        'place_desc',
        // geom
        'section_name',
        'theme_name',
        'stype_name',
        {name: 'publish_date', type: 'date'},
        //'load_id', //unnecessary for user views
        'author_name',
        'publisher_name'
    ]
});

// No validators here: should only validate on input probably
    //validators: {
    //    title: {type: 'length', min: 4},
    //    weblink: 'presence' //WISHLIST @^(https?|ftp)://[^\s/$.?#].[^\s]*$@iS (from https://mathiasbynens.be/demo/url-regex, @stephenhay)
    //}