// Store where the markup will be applied
var qrSection = document.getElementById('QuestionnaireResponse');
var qrJSONInput = document.getElementById('jsonInput');
var qrSubmitButton = document.getElementById('submit');
var qrDropdownBox = document.getElementById('jsonDropdown');

//Initial JSON load
const qrSampleRequestURL = 'response.json';
const qrExampleHomecareRequestURL = 'samplehomecareref.json';
getJSONData(qrSampleRequestURL);

/* Receives a URL pointing to a JSON file either locally or on the web, parses through
the retrived data, stores it in the textarea for editing, and updates the page to display it */
function getJSONData(URL) {
    var qrRequest = new XMLHttpRequest();
    qrRequest.open('GET', URL);
    qrRequest.responseType = 'json';
    qrRequest.send();

    /* When the JSON loads, call the function to populate the payload data onto the
    webpage and populate the text-area with a text version of the data for testing */
    qrRequest.onload = function () {
        let qResponse = qrRequest.response;
        qrJSONInput.textContent = JSON.stringify(qResponse, undefined, 3);
        populateResponse(qResponse);
    }
}

// Event Listener for the dropdown box
qrDropdownBox.addEventListener('change', (event) => {

    const result = event.target.value;

    clearJSONResults();
    if (result == 1) {
        getJSONData(qrSampleRequestURL);
    }
    if (result == 2) {
        getJSONData(qrExampleHomecareRequestURL);
    }

});

// Event Listener for the submit button
qrSubmitButton.addEventListener("click", function (event) {

    clearJSONResults();

    // Populate the page with new data taken from the textview
    let updateText = qrJSONInput.value;
    let updatedJSON = JSON.parse(updateText);
    populateResponse(updatedJSON);
});

/* Parse through the JSON file, checking for nested and conditional properties,
then displaying all of the response contents to a section on the page */
function populateResponse(jsonObj) {
    let headers = jsonObj.resource.item;

    //Loop through the main categorical section headers or non-header questions in the first item
    for (var indexHeader = 0; indexHeader < headers.length; indexHeader++) {

        /* If there is an "answer" defined at this point, either it is a conditional question,
        or a question without any header, display the items, indenting any conditional items */
        if (typeof headers[indexHeader].answer !== 'undefined') {

            let line = renderQuestion(headers[indexHeader]);
            let answer = renderConditionalAnswer(headers[indexHeader].answer[0]);
            line.appendChild(answer);
            qrSection.appendChild(line);

            //Check if there are subquestions
            if (typeof headers[indexHeader].item !== 'undefined') {

                //Loop through any questions which contain no header item above them
                let answers = headers[indexHeader].answer;

                // If there are questions without any headers
                if (typeof answers.length !== 'undefined') {

                    for (var indexCondAnswer = 0; indexCondAnswer < answers.length; indexCondAnswer++) {

                        if (typeof headers[indexHeader].answer[indexCondAnswer].item.length !== 'undefined') {

                            //Loop through the associated sub-questions
                            for (var indexSubQuestion = 0; indexSubQuestion < headers[indexHeader].answer[indexCondAnswer].item.length; indexSubQuestion++) {

                                let indent = document.createElement('div');
                                indent.style.marginLeft = '2em';
                                let line = renderQuestion(headers[indexHeader].answer[indexCondAnswer].item[indexSubQuestion]);

                                //Loop through the answers to each sub-question
                                let answers = headers[indexHeader].answer[indexCondAnswer].item[indexSubQuestion].answer;
                                for (var indexSubAnswer = 0; indexSubAnswer < answers.length; indexSubAnswer++) {

                                    let answer = renderAnswer(answers[indexSubAnswer]);
                                    line.appendChild(answer);

                                }

                                indent.appendChild(line);
                                qrSection.appendChild(indent);
                            }

                        }




                    } // end of the loop to the conditional question's answer 
                }

            } else {

                //Loop the sub-questions and answer(s) to the conditional question
                let answers = headers[indexHeader].answer;

                for (var indexCondAnswer = 0; indexCondAnswer < answers.length; indexCondAnswer++) {

                    if (typeof headers[indexHeader].answer[indexCondAnswer].item !== 'undefined') {

                        //Loop through the associated sub-questions
                        for (var indexSubQuestion = 0; indexSubQuestion < headers[indexHeader].answer[indexCondAnswer].item.length; indexSubQuestion++) {

                            let indent = document.createElement('div');
                            indent.style.marginLeft = '2em';
                            let line = renderQuestion(headers[indexHeader].answer[indexCondAnswer].item[indexSubQuestion]);

                            //Loop through the answers to each sub-question
                            let answers = headers[indexHeader].answer[indexCondAnswer].item[indexSubQuestion].answer;
                            for (var indexSubAnswer = 0; indexSubAnswer < answers.length; indexSubAnswer++) {

                                let answer = renderAnswer(answers[indexSubAnswer]);
                                line.appendChild(answer);

                            }

                            indent.appendChild(line);
                            qrSection.appendChild(indent);
                        }

                    }

                } // end of the loop to the conditional question's answer 

            }


            // Standard questions and answers will be displayed as no conditional was detected
        } else {

            let header = document.createElement('h1');
            header.textContent = headers[indexHeader].text;
            qrSection.appendChild(header);

            //Loop through the questions and display them in bold text
            for (var indexSubQuestion = 0; indexSubQuestion < headers[indexHeader].item.length; indexSubQuestion++) {

                let line = renderQuestion(headers[indexHeader].item[indexSubQuestion]);
                qrSection.appendChild(line);

                //jsonObj.resource.item[i].item[x].answer
                let answers = headers[indexHeader].item[indexSubQuestion].answer;
                for (var indexSubAnswer = 0; indexSubAnswer < answers.length; indexSubAnswer++) {

                    //Loop through answers and append next to questions, multi-select are separated with commas
                    if (answers.length > 1) {

                        //On the last answer in multi-select, don't include a comma (stop at 2nd last)
                        if (indexSubAnswer <= (answers.length - 2)) {
                            let answer = renderMultiAnswer(answers[indexSubAnswer]);
                            line.appendChild(answer);
                        } else {
                            let answer = renderAnswer(answers[indexSubAnswer]);
                            line.appendChild(answer);
                        }

                    } else {
                        //Only 1 answer was received
                        let answer = renderAnswer(answers[indexSubAnswer])
                        line.appendChild(answer);
                    }

                }

            }
        } // end of the Else for if the headers has an "answer" defined instead of just a standard item

    } // End of the (for i = 0...) headers loop
}

/* Determines which of the associated datatypes is contained
 in the answer object and returns the answer as a string */
function getAnswerText(obj) {
    let response = "";

    for (item in obj) {
        let itemText = item;
        response += obj[itemText];
    }

    return response;
}

/* Displays a question on the page by taking an object, creating a paragraph element,
styling it bold with a span, and then returning the question paragraph as an object,
verifies whether the last character of the question is a semi-colon, if not one is added */
function renderQuestion(obj) {
    let line = document.createElement('p');
    let question = document.createElement('span');
    question.style.fontWeight = 'bold';
    if (obj.text.charAt(obj.text.length - 1) == ":") {
        question.textContent = obj.text + " ";
    } else {
        question.textContent = obj.text + ': ';
    }
    line.appendChild(question);

    return line;
}

/* Displays an answer on the page by taking an object, creating a span element with a
normal style applied, to remove any bolding, and then returns the answer as an object */
function renderAnswer(obj) {
    let answer = document.createElement('span');
    answer.style.fontWeight = 'normal';
    answer.textContent = getAnswerText(obj);

    return answer;
}

/* Displays a Multi-line answer on the page by taking an object, creating a span element
with a normal style applied, to remove any bolding, adding a comma at the end, and then
returns the answer as an object */
function renderMultiAnswer(obj) {
    let answer = document.createElement('span');
    answer.style.fontWeight = 'normal';
    answer.textContent = getAnswerText(obj) + ', ';

    return answer;
}

/* Displays an answer on the page by taking an object, creating a span element with a
normal style applied, to remove any bolding, and then returns the answer as an object,
this should typically be used for a true/false boolean question */
function renderConditionalAnswer(obj) {
    let answer = document.createElement('span');
    answer.style.fontWeight = 'normal';
    answer.textContent = getConditionalAnswerText(obj);

    return answer;
}

/* Determines which type of value the object is holding then returns it as a string.
  Returns a blank string if it does not contain a supported type */
function getConditionalAnswerText(obj) {
    let response = "";

    if (typeof obj.valueBoolean !== 'undefined') {
        response += obj.valueBoolean;
    }

    if (typeof obj.valueDecimal !== 'undefined') {
        response += obj.valueDecimal;
    }

    if (typeof obj.valueInteger !== 'undefined') {
        response += obj.valueInteger;
    }

    if (typeof obj.valueDate !== 'undefined') {
        response += obj.valueDate;
    }

    if (typeof obj.valueDateTime !== 'undefined') {
        response += obj.valueInteger;
    }

    if (typeof obj.valueTime !== 'undefined') {
        response += obj.valueTime;
    }

    if (typeof obj.valueString !== 'undefined') {
        response += obj.valueString;
    }

    if (typeof obj.valueUri !== 'undefined') {
        response += obj.valueUri;
    }

    if (typeof obj.valueAttachment !== 'undefined') {
        response += obj.valueAttachment;
    }

    if (typeof obj.valueCoding !== 'undefined') {
        response += obj.valueCoding;
    }

    if (typeof obj.valueQuantity !== 'undefined') {
        response += obj.valueQuantity;
    }

    return response;
}

// Remove the previous JSON data from the page so new data can be displayed
function clearJSONResults() {
    while (qrSection.firstChild) {
        qrSection.removeChild(qrSection.firstChild);
    }
}
