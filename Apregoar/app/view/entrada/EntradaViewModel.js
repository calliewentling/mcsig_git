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
                reader:
                {
                    type: 'json'
                },
                url: 'app/store/entradaEntries.json',
                writer: {
                    type: 'json',
                    dateFormat: 'd/m/Y',
                    writeAllFields: true
                }
            }
        },
    }
});

//        EntradaListPagingStore: {
//            model: 'Apregoar.model.Entrada',
//            autoLoad: true,
//            pageSize: 5,
//            proxy:
//           {
//               type: 'rest',
//               reader:
//               {
//                   rootProperty: 'data',
//                   type: 'json',
//                   totalProperty: 'TotalCount'
//               },
//               url: '/api/entrada'
//           }
//        }