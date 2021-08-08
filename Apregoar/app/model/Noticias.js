ExtensionScriptApis.define('Noticias', {
    extend: 'Ext.data.Model',
    idProperty: 'story_id',
    fields: [
        {name: 'story_id', type: 'int'},
        'title',
        'summary',
        'contents',
        'web_link',
        {name: 'publish_date', type: 'date'},
        //'load_id', //unnecessary for user views
        'author_name',
        'publisher_name',
        'stype_name',
        'theme_name',
        'section_name',
        'story_id',
        {name: 't_begin', type: 'date'},
        {name: 't_end', type: 'date'},
        't_type',
        't_desc',
        {name: 'place_id', type: 'int'},
        {name: 'sinstance_id', type: 'int'},
        'place_name',
        'place_desc'
        //'geom' //not relevant in view
    ],
    validators: {
        title: {type: 'length', min: 4},
        weblink: 'presence'
    }
});