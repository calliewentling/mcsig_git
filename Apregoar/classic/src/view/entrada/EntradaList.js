Ext.define('Apregoar.view.entrada.EntradaList', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Apregoar.model.Entrada',
        //'Apregoar.store.EntradaEntries'
    ],
    xtype: 'entradaList',


    title: 'Todas as Entradas',

    controller: 'entrada-list',
    viewModel: { type: 'entradaviewmodel' },
    reference:'entradalistgrid',
    selType: 'rowmodel',
    selModel:
    {
        mode: 'SINGLE'
    },
    viewConfig:
    {
        stripeRows: true
    },
    listeners: {
        selectionchange: 'onSelectionChange'
    },
    bind: {
        store: '{EntradaListStore}'
        //store: 'entradaEntry'
    },
    initComponent: function () {
        Ext.apply(this,
        {
            plugins: [Ext.create('Ext.grid.plugin.RowEditing',
            {
                clicksToEdit: 2
            })],
//EDIT HERE
            columns: [
                {
                    text: "Id",
                    dataIndex: 'entradaId',
                    width: 45
                },
                {
                    text: "Título",
                    flex: 1,
                    dataIndex: 'title',
                    editor:
                    {
                        // defaults to textfield if no xtype is supplied
                        allowBlank: false
                    }
                },
                {
                    text: "Resumo",
                    flex: 1,
                    dataIndex: 'summary',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                {
                    text: "Ligação",
                    flex: 1,
                    dataIndex: 'webLink',
                    editor:
                    {
                        allowBlank: false
                    }
                },
                {
                    xtype: 'datecolumn',
                    header: "Data do Inîcio",
                    width: 135,
                    dataIndex: 'tBegin',
                    editor:
                    {
                        xtype: 'datefield',
                        allowBlank: false
                    },
                    renderer: Ext.util.Format.dateRenderer('d/m/Y')
                },
                {
                    xtype: 'datecolumn',
                    header: "Data do Fim",
                    width: 135,
                    dataIndex: 'tEnd',
                    editor:
                    {
                        xtype: 'datefield',
                        allowBlank: false
                    },
                    renderer: Ext.util.Format.dateRenderer('Y-m-d')
                },
                {
                    text: "Descrição temporal",
                    flex: 1,
                    dataIndex: 'tDesc',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                {
                    text: "Localização",
                    flex: 1,
                    dataIndex: 'placeName',
                    editor:
                    {
                        allowBlank: false
                    }
                },
                {
                    text: "Descrição espacial",
                    flex: 1,
                    dataIndex: 'placeDesc',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                // Add geometry definition here
                {
                    text: "Secção",
                    flex: 1,
                    dataIndex: 'sectionName',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                {
                    text: "Tema",
                    flex: 1,
                    dataIndex: 'themeName',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                {
                    text: "Tipo",
                    flex: 1,
                    dataIndex: 'stypeName',
                    editor:
                    {
                        allowBlank: true
                    }
                },
                {
                    xtype: 'datecolumn',
                    header: "Data do Publicação",
                    width: 135,
                    dataIndex: 'publishDate',
                    editor:
                    {
                        xtype: 'datefield',
                        allowBlank: false
                    },
                    renderer: Ext.util.Format.dateRenderer('Y-m-d')
                },
                {
                    text: "Autor",
                    flex: 1,
                    dataIndex: 'authorName',
                    editor:
                    {
                        allowBlank: false
                    }
                },
                {
                    text: "Editor",
                    flex: 1,
                    dataIndex: 'publisherName',
                    editor:
                    {
                        allowBlank: false
                    }
                },
            ],
            tbar: [
                {
                    text: 'Entra Notícia',
                    iconCls: 'fa-plus',
                    handler: 'onAddClick'
                }, {
                    itemId: 'removeEntrada',
                    text: 'Apaga Entrada',
                    iconCls: 'fa-times',
                    reference: 'btnRemoveEntrada',
                    handler: 'onRemoveClick',
                    disabled: true
                }
            ]

        });

        this.callParent(arguments);
    }
});