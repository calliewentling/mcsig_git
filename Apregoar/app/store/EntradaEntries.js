Ext.define('Apregoar.store.EntradaEntries', {
    extend: 'Ext.data.Store',
    alias: 'store.entradaEntry',
    model: 'Entrada',

    proxy: {
        type: 'ajax',
        url: 'app/store/entradaEntries.json',
        //url: 'php/entradas.php',
        reader: {
            type: 'json',
        }
    },

    //autoLoad: true
});