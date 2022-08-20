// /**
//  * Function to capture sender's email and recipients' emails. 
//  *
//  * Author: Diego Pava
//  */


// Requests user to input their email and an array of emails 
// Checks emails' validity
// If email input is invalid, returns an alert to feedback the user. 

export default function getEmails() {
    // Get sender's email
    let senderEmail = prompt('Please type your email\n(We will only use this to inform the recipients who sent the results)');

    // Check if email is valid
    if (/@/.test(senderEmail) == false || senderEmail.length < 1) {
        return alert(`Invalid input: ${senderEmail}`);
    }

    // Check recipients' emails, initialize invalid list of emails
    let invalidEmails = [];
    let emails = prompt('Please insert the email address(es) to share these results. Use a \',\' to separate each email');
    let emailList = emails.split(',');

    // Checks every email for '@', if invalid, they are appended to invalid array. 
    for (let i = 0; i < emailList.length; i++) {
        if (/@/.test(emailList[i]) == false) {
            invalidEmails.push(emailList[i]);
        }
    }

    // Checks for invalid emails or empty inputs. Notifies the user of the error and a list of the erroneus inputs.
    if (invalidEmails.length > 0) {
        return alert(`Invalid email adress(es): ${invalidEmails}\nPlease try again.`);
    }
    else if (emailList.length < 1) {
        return alert('No emails were inserted.\nPlease try again.');
    }

    return { 'sender': senderEmail, 'emails': emailList };

}