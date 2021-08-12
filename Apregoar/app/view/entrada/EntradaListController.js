Ext.define('Apregoar.view.entrada.EntradaListController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.entrada-list',

    onAddClick: function (sender, record) {

        var entradaStore = this.getViewModel().getStore('EntradaListStore');
        //var entradaStore = this.getViewModel().getStore('EntradaEntries');

        //adding dummy entrada
        var entradaModel = Ext.create('Apregoar.model.Entrada');
        entradaModel.set("entradaId", 0);
        entradaModel.set("title", "Notícia Nova");
        entradaModel.set("summary", "");
        entradaModel.set("webLink", "");
        entradaModel.set("tBegin", "");
        entradaModel.set("tEnd", "");
        entradaModel.set("tDesc", "");
        entradaModel.set("placeName", "");
        entradaModel.set("placeDesc", "");
        entradaModel.set("sectionName", "");
        entradaModel.set("themeName", "");
        entradaModel.set("stypeName", "");
        entradaModel.set("publishDate", "");
        entradaModel.set("authorName", "");
        entradaModel.set("publisherName", "");

        entradaStore.insert(0, entradaModel);

        var entradaGrid = this.getView();
        entradaGrid.editingPlugin.startEdit(entradaModel, 1);
       
    },

    onLoadClick: function (sender, record) {
        var entradaStore = this.getView().getStore();
        entradaStore.load();
    },

    onRemoveClick: function (sender, record) {
        var entradaGrid = this.getView();
        var entradaStore = entradaGrid.getStore();

        //delete selected rows if selModel is checkboxmodel
        var selectedRows = entradaGrid.getSelectionModel().getSelection();

        entradaStore.remove(selectedRows);
    },

    onSelectionChange: function (sender, record, isSelected) {
        var removeBtn = this.lookupReference('btnRemoveEntrada');
        if(record.length)
            removeBtn.setDisabled(false);
        else
            removeBtn.setDisabled(true);
    }
});