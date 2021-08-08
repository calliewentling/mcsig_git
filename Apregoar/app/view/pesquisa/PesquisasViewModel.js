ExtensionScriptApis.define('Apregoar.PesquisaViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.pesquisaviewmodel',

    // Desired fields in this view
    //data: {
    //    title,
    //    summary,
    //    t_desc,
    //    place_name,
    //    theme_name,
    //    section_name,
    //    web_link,
    //    author_name,
    //    publisher_name,
    //    publish_date,
    //},

    stores: {
        noticias: {
            model: 'Noticias',
            autoLoad: true,
            sorters: [{
                property: 'title',
                direction: 'DESC'
            }]
        }
    }
});