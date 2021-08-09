Ext.define('Apregoar.view.entrada.EntradaForm', {
    extend: 'Ext.form.Panel',
    xtype: 'entradaForm',
    title: 'Entra Noticias Form',

    // added this part as a test to fix dependencies
    requires: [
        "Apregoar.view.entrada.EntradaFormController"
    //    "Apregoar.app.Entrada"
    ],

    controller: 'entrada-form',

    initComponent: function() {
        Ext.apply(this, {
            //set jsonsubmit to true for CUD operation using formSubmit()
            jsonSubmit: true,
            url: 'api/entrada',
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
                        fieldLabel: 'entrada_id',
                        name: 'entrada_id',
                        readOnly: true,
                        width: 55
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
                    fieldLabel: 'Ligação com a notícia original',
                    name: 'web_link'
                },{
                    xfield: 'datefield',
                    fieldLabel: 'Inicio de instância',
                    name: 't_begin'
                },{
                    xfield: 'datefield',
                    fieldLabel: 'Fim de instância',
                    name: 't_end'
                },{
                    fieldLabel: 'Descrição temporal',
                    name: 't_desc'
                },{
                    fieldLabel: 'Localização',
                    name: 'place_name',
                },{
                    fieldLabel: 'Descrição do lugar',
                    name: 'place_desc'
                //},{
                    // Include geoinput element
                },{
                    fieldLabel: 'Secção',
                    name: 'section_name'
                },{
                    fieldLabel: 'Tema',
                    name: "themename"
                },{
                    fieldLabel: 'Tipo',
                    name: 'stype_name'
                },{
                    xfield: 'datefield',
                    fieldLabel: 'Data de publicar',
                    name: 'publish_date',
                },{
                    fieldLabel: 'Autor',
                    name: "author_name"
                },{
                    fieldLabel: "Editor",
                    name: 'publisher_name'
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


