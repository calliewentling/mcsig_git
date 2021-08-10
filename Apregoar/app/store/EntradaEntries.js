Ext.define('Apregoar.store.EntradaEntries', {
    extend: 'Ext.data.Store',

    alias: 'store.entradaEntry',

    model: 'Entrada',

    proxy: {
        type: 'ajax',
        url: 'app/store/entradaEntries.json',
        reader: {
            type: 'json',
        }
    }
});