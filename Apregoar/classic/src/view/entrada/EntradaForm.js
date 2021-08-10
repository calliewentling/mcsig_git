Ext.define('Apregoar.view.entrada.EntradaForm', {
    extend: 'Ext.form.Panel',
    xtype: 'entradaForm',
    title: 'Entra Noticias Form',

    // added this part as a test to fix dependencies
    requires: [
        "Apregoar.view.entrada.EntradaFormController",
        "Apregoar.model.Entrada"
    ],

    controller: 'entrada-form',

    initComponent: function() {
        Ext.apply(this, {
            //set jsonsubmit to true for CUD operation using formSubmit()
            jsonSubmit: true,
            url: 'app/store/entradaEntries.json',
            resizable: false,
            collapsable: false,
            bodyPadding: '5',
            buttonAlign: 'center',
            border: false,
            trackResetOnLoad: true,
            layout:
            {
                type: 'vbox'
            },
            fieldDefaults:
            {
                xtype: 'textfield',
                msgTarget: 'side',
                labelAssign: 'top',
                labelStyle: 'font-weight:bold'
            },
            defaultType: 'textfield',
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaultType: 'textfield',
                    width: '100%',
                    fieldDefaults:
                    {
                        labelAlign: 'top',
                        labelStyle: 'font-weight:bold'
                    },
                    items: [{
                        fieldLabel: 'Entrada ID',
                        name: 'entradaId',
                        readOnly: true,
                        width: 100
                    },{
                        fieldLabel: 'Titulo',
                        flex: 1,
                        name: 'title',
                        margin: ' 0 0 0 5',
                        allowBlank: false
                    }],
                },{
                    fieldLabel: 'Resumo',
                    name: "summary",
                    width: '100%'
                },{
                    //xtype: 'urlfield',
                    fieldLabel: 'Ligação com a notícia original',
                    name: 'webLink',
                    width: '50%'
                },{
                    xtype: 'datefield',
                    anchor: '100%',
                    fieldLabel: 'Inicio de instância',
                    name: 'tBegin'
                },{
                    xtype: 'datefield',
                    anchor: '100%',
                    fieldLabel: 'Fim de instância',
                    name: 'tEnd'
                },{
                    fieldLabel: 'Descrição temporal',
                    name: 'tDesc'
                },{
                    fieldLabel: 'Localização',
                    name: 'placeName',
                },{
                    fieldLabel: 'Descrição do lugar',
                    name: 'placeDesc'
                //},{
                    // Include geoinput element
                },{
                    fieldLabel: 'Secção',
                    name: 'sectionName'
                },{
                    fieldLabel: 'Tema',
                    name: "themeName"
                },{
                    fieldLabel: 'Tipo',
                    name: 'stypeName'
                },{
                    xtype: 'datefield',
                    anchor: '100%',
                    fieldLabel: 'Data de publicar',
                    name: 'publishDate',
                },{
                    fieldLabel: 'Autor',
                    name: "authorName"
                },{
                    fieldLabel: "Editor",
                    name: 'publisherName'
                }
            ],
        buttons: [
            {
                text: 'Entrar',
                itemId: 'btnEntrar',
                formBind: true,
                handler: 'onCreateClick'
            //},{
            //    text: 'Ler',
            //    itemId: 'btnLoad',
            //    handler: 'onReadClick'
            //},{
            //    text: 'Atualizar',
            //    itemId: 'btnUpdate',
            //    formBind: true,
            //    handler: 'onUpdateClick'
            //},{
            //    text: 'Apagoar',
            //    itemID: 'btnDelete',
            //    formBind: true,
            //    handler: 'onDeleteClick'
            //},{
            //    text: 'Repor',
            //    itemId: 'btnReset',
            //    handler: 'onResetClick',
            },{
                text: 'Limpar',
                itemId: 'btnClear',
                handler: 'onClearClick'
            }
        ]});
        this.callParent(arguments);
    },
    clearForm: function () {
        this.getForm().getFields().each(function (field){
            field.validateOnChange = false;
            field.setValue('');
            field.resetOriginalValue();
        });
    }
});
//Add validation


