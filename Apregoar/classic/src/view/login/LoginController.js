Ext.define('Apregoar.view.login.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',

    onLoginClick: function() {
        
        //This would be the ideal location to verify the user's credentials via a server-side lookup.

        //Set the localStorage value to true
        localStorage.setItem("ApregoarLoggedIn", true);

        //Remove Login Window
        this.getView().destroy();

        // Add the main view to the viewport
        Ext.create({
            xtype: 'app-main'
        });
    }
});