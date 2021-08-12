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
                    type: 'application/json'
                },
                url: 'php/entradas.php',
                writer: {
                    type: 'application/json',
                    dateFormat: 'Y-m-d',
                    writeAllFields: true
                }
            }
            // proxy: {
            //     type: 'direct',
            //     directFn: "QueryEntradas.getResults"
            // },
        }
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