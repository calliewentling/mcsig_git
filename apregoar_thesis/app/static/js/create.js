/*const form = document.getElementsByTagName('addStory')[0];

const vtitle = document.getElementById('title');

const vtitleError = document.querySelector('#title + span.error');
vtitle.addEventListener('input', function (event) {
    //Each time the user types something, we check if the form fields are valid
    if (vtitle.validity.valid) {
        //In case there is an error message visible, if the field is valid, we remove the error message.
        vtitleError.innterHTML = ''; //Reset the content of the message
        vtitleError.className = 'error'; //reset the visual state of the message
    } else {
        // If there is still an error, show the correct error
        showError();
    }
});
form.addEventListener('submit', function (event) {
    if (!vtitle.validity.valid) {
        // If it isn't, we display the appropriate error message
        showError();
        //Then prevent the form from being sent by canceling the event
        event.preventDefault();
    }
});
function showError() {
    if(vtitle.validity.valueMissing) {
        //If the field is empty display the following error message
        vtitleError.textContent ="Enter Title";
    } else if(vtitle.validity.tooShort) {
        //If the data is too short display the following error message.
        vtitleError.textContent = "Title should be at least ${ vtitle.minLength } characters.";
    }
    //Set the styling
    vtitleError.className = 'error active';
}
*/