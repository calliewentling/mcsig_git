Ext.define('Apregoar.view.entrada.EntradaFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.entrada-form',

    // Entrar is not giving an error, but it isn't doing anything either
    onCreateCLick: function(sender, record) {
        var entradaForm = this.getView().getForm();

        if (!entradaForm.isDirty()) {
            Ext.Msg.alert('Status','No new data to create.');
            return;
        }
        else if (!entradaForm.isValid()) {
            Ext.Msg.alert('Status', 'Invalid data.');
            return;
        }

        // Submit the Ajax request and handle the response
        entradaForm.submit({
            url: '/api/entrada',
            waitMsg: 'Saving...',
            headers: {
                'Content-Type': 'application/json'
            },
            clientValidation: true,
            submitEmptyText: true,
            success: function (form, action) {
                var entrada = Ext.create('Apregoar.model.Entrada');
                var resp = Ext.decode(action.response.responseText);
                
                if (resp.data[0]) {
                    // addentrada retrns entrada model with Id so we can re-load model into form so form will have isDirty flase
                    entrada.set(resp.data[0]);
                    entradaForm.loadRecord(entrada);
                }

                Ext.Msg.alert('Status', 'Saved successfully.');

            },
            failure: function (form, action) {
                if (action.failureType === Ext.form.action.Action.CLIENT_INVALID) {
                    Ext.Msg.alert('CLIENT_INVALID', 'Something has been missed. Please check and try again.');
                }
                if (action.failureType === Ext.form.action.Action.CONNECT_FAILURE) {
                    Ext.Msg.alert('CONNECT_FAILURE', 'Status: ' + action.response.status + ': ' + action.response.statusText);
                }
                if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
                    Ext.Msg.alert('SERVER_INVALID', action.result.message);
                }
            }
        });
    },
    // //NOT WORKING: 
    //onReadClick: function (sender, record){
    //   var entradaForm = this.getView().getForm();
    //    //result should contain success=true and data property otherwise it will go to failure even if there is no failure
    //    entradaForm.load({
    //        waitMsg: 'Loading...',
    //        method: 'GET',
    //        params:{
    //            id = 1
    //        },
    //        success: function(form, action) {
    //            try {
    //                var resp = Ext.decode(action.response.responseText);
    //                if (resp.data.length > 0) {
    //                    //addentrada returns entrada model with Id so we can reload model into form so form will have isDirty false
    //                    var entrada = Ext.create('Apregoar.model.Entrada');
    //                    entrada.set(resp.data[0]);
    //                    entradaForm.loadRecords(entrada);
    //                }
    //            }
    //            catch (ex) {
    //                Ext.Msg.alert('Status', 'Exception: ' + ex.Message);
    //            }
    //        },
    //        failure: function(form, action) {
    //            Ext.Msg.alert("Load failed", action.result.errorMessage);
    //        }
    //    });
    //},
    onUpdateClick: function (sender, record) {
        var entradaForm = this.getView().getForm();

        if (!entradaForm.isDirty()) {
            Ext.Msg.alert('Status', 'No pending changes to save.');
            return;
        }

        else if (!entradaForm.isValid()) {
            Ext.Msg.alert('Status', 'Invalide data.');
        }

        entradaForm.submit({
            url: '/api/entrada/',
            waitMsg: 'Updating...',
            method: 'PUT',
            header: {
                'Content-Type': 'application/json'
            },
            clientValidation: true,
            success: function (form, action) {
                try {
                    var entrada = Ext.create('Apregoar.model.Entrada');
                    var resp = Ext.decode(action.response.responseText);

                    if (resp.data.length > 0) {
                        // addentrada returns entrada model with Id so we can re-load model into form so form will have isDirty false
                        entrada.set(resp.data[0]);
                        entradaForm.loadRecord(entrada);
                    }

                    Ext.Msg.alert('Status', 'Saved successfully.');
                }
                catch (ex) {
                    Ext.Msg.alert('Status', 'Exception: ' + ex.Message);
                }
            },
            failure: function (form, action) {
                if (action.failureType === Ext.form.action.Action.CLIENT_INVALID) {
                    Ext.Msg.alert('CLIENT_INVALID', 'Something has been missed. Please check and try again.');
                }
                if (action.failureType === Ext.form.action.Action.CONNECT_FAILURE) {
                    Ext.Msg.alert('CONNECT_FAILURE', 'Status: ' + action.response.status + ': ' + action.response.statusText);
                }
                if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
                    Ext.Msg.alert('SERVER_INVALID', action.result.message);
                }
            }
        });
    },
    onDeleteClick: function (sender, record) {
        var me = this,
            entradaForm = me.getView();
        
        if (!entradaForm.getValues(false, false, false, true).Id) {
            Ext.Msg.alert('Status', 'Invalid or No data to delete.');
            return;
        }

        var entrada = Ext.create('Apregoar.model.Entrada'), data;

        entrada.set(entradaForm.getValues());
        data = entrada.getData();

        Ext.Msg.show({
            title: 'Delete',
            msg: 'Quer apagar esta entrada? ',
            width: 300,
            closable: false,
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function (buttonValue, inputText, showConfig) {
                if (buttonValue === 'yes') {
                    entradaForm.submit({
                        url: '/api/entrada',
                        method: 'DELETE',
                        clientValidation: true,
                        waitMsg: 'Apagando...',
                        headers: {
                            'Content-Type': 'application/json'
                        },

                        success: function (form, action) {
                            try {
                                var resp = Ext.decode(action.response.responseText);
                                entradaForm.clearForm();
                                Ext.Msg.alert('Success', resp.message);
                            }
                            catch (ex) {
                                Ext.Msg.alert('Status', 'Exception: ' + ex.Message);
                            }
                        },
                        failure: function (form, action) {
                            if (action.failureType === Ext.form.action.Action.CLIENT_INVALID) {
                                Ext.Msg.alert('CLIENT_INVALID', 'Something has been missed. Please check and try again.');
                            }
                            if (action.failureType === Ext.form.action.Action.CONNECT_FAILURE) {
                                Ext.Msg.alert('CONNECT_FAILURE', 'Status: ' + action.response.status + ': ' + action.response.statusText);
                            }
                            if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
                                Ext.Msg.alert('SERVER_INVALID', action.result.message);
                            }
                        }
                    });
                }
            }
        });
    },
    onResetClick: function (sender, record) {
        this.getView().getForm().reset();
    },
    onClearClick: function (sender, record) {
        this.getView().clearForm();
    }
});