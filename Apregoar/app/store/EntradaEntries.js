Ext.define('Apregoar.store.EntradaEntries', {
    extend: 'Ext.data.Store',
    alias: 'store.entradaEntry',
    model: 'Entrada',

    proxy: {
        type: 'ajax',
        //url: 'app/store/entradaEntries.json',
        url: 'php/entradas.php',
        method: "POST",
        reader: {
            type: 'json',
        }
    },

    autoLoad: true
});