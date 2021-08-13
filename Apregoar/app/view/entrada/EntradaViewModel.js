Ext.define('Apregoar.view.entrada.EntradaViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.entradaviewmodel',
    stores: {
        EntradaListStore: {
            model: 'Apregoar.model.Entrada',
            autoLoad: true,
            autoSync: true,
            proxy:
            {
                type: 'ajax',
                //method: "POST",
                reader:
                {
                    type: 'json'
                },
                url: 'php/entradas.json',
                writer: {
                    type: 'json',
                    dateFormat: 'Y-m-d',
                    writeAllFields: true
                }
            }
        }
    }
});
