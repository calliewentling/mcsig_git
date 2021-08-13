Ext.define('Apregoar.view.story.StoryForm', {
    extend: 'Ext.form.Panel',
    xtype: 'storyform',
    //renderTo: document.body,

    requires: [
        'Apregoar.store.NewStories'
    ],
    title: 'Add New Story',
    height: 350,
    width: 500,
    bodyPadding: 10,
    defaultType: 'textfield',
    url: 'add_story',
    items: [
        {
            fieldLabel: 'Title', 
            name: 'title',
        },{
            fieldLabel: 'Link to original',
            name: 'webLink',
        },{
            xtype: 'datefield',
            fieldLabel: 'Date of Publish',
            name: 'publishDate',
            msgTarget: 'under', //location of error message
            invalidText: '"{0}" invalid. "{1}" valid.' //custom error message
        }
    ],
    buttons: [
        {
            text: 'Submit',
            handler: function() {
                var form = this.up('form'), //get the form panel
                    record = form.getRecord(); //get the underlying model instance
                if (form.IsValid()) {//make sure the form contains valid data beore submitting}
                    form.updateRecord(record); // update the record with the form data
                    record.save({ // save hte record to the server
                        success: function(story) {
                            Ext.Msg.alert('Success', action.result.msg)
                        },
                        failure: function(story) {
                            Ext.msg.alert('Failure', action.result.msg)
                        }
                    });
                } else { // display error alert if hte data is invalid
                    Ext.msg.alert('Invalid Data', 'Please correct form errors.')
                }
            }
        }
    ]
});

//https://docs.sencha.com/extjs/6.2.0/guides/components/forms.html
