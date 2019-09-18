// Store the elements where the markup will be applied
var qrSection = document.getElementById('QuestionnaireResponse');
var qrJSONInput = document.getElementById('jsonInput');
var qrSubmitButton = document.getElementById('submit');
var qrDropdownBox = document.getElementById('jsonDropdown');

// Initial JSON load
const qrSampleRequestURL = 'sample.json';
const qrSampleNoHeadersRequestURL = 'samplenoheaders.json';
const qrExampleHomecareRequestURL = 'samplehomecareref.json';

getJSONData(qrSampleRequestURL);

/* Receives a URL pointing to a JSON file parses through the retrived data, stores
it in the textarea for editing, and updates the page to display it */
function getJSONData(URL) {
    let qrRequest = new XMLHttpRequest();
    qrRequest.open('GET', URL);
    qrRequest.responseType = 'json';
    qrRequest.send();

    /* When the JSON loads, call the function to populate the payload data onto the
    webpage and populate the text-area with a text version of the data for testing */
    qrRequest.onload = function() {
        let qResponse = qrRequest.response;
        qrJSONInput.textContent = JSON.stringify(qResponse, undefined, 3);
        populateResponse(qResponse);
    };
}

// Event Listener for the dropdown box
qrDropdownBox.addEventListener('change', event => {
    const result = event.target.value;

    clearJSONResults();
    if (result == 1) {
        getJSONData(qrSampleRequestURL);
    }
    if (result == 2) {
        getJSONData(qrSampleNoHeadersRequestURL);
    }
    if (result == 3) {
        getJSONData(qrExampleHomecareRequestURL);
    }
});

// Event Listener for the submit button
qrSubmitButton.addEventListener('click', function(event) {
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
            //Display questions/answers which are not nested in a header
            let line = renderQuestion(headers[indexHeader]);
            let answer = renderAnswer(headers[indexHeader].answer[0]);
            line.appendChild(answer);
            qrSection.appendChild(line);

            //Loop through conditional sub-questions and answer(s)
            let answers = headers[indexHeader].answer;
            for (
                var indexCondAnswer = 0;
                indexCondAnswer < answers.length;
                indexCondAnswer++
            ) {
                //Confirm at least 1 sub-question is stored
                if (
                    typeof headers[indexHeader].answer[indexCondAnswer].item !==
                    'undefined'
                ) {
                    //Loop through the sub-questions and indent
                    for (
                        var indexSubQuestion = 0;
                        indexSubQuestion <
                        headers[indexHeader].answer[indexCondAnswer].item
                            .length;
                        indexSubQuestion++
                    ) {
                        let line = renderQuestion(
                            headers[indexHeader].answer[indexCondAnswer].item[
                                indexSubQuestion
                            ]
                        );
                        line.classList.add('indent');

                        //Loop through the answers to each sub-question
                        let answers =
                            headers[indexHeader].answer[indexCondAnswer].item[
                                indexSubQuestion
                            ].answer;
                        for (
                            var indexSubAnswer = 0;
                            indexSubAnswer < answers.length;
                            indexSubAnswer++
                        ) {
                            let answer = renderAnswer(answers[indexSubAnswer]);
                            line.appendChild(answer);
                        }

                        qrSection.appendChild(line);
                    }
                }
            } // end of the loop to the conditional sub-questions

            // Standard questions and answers will be displayed, no conditional/headerless or subquestion was detected
        } else {
            let header = document.createElement('h1');
            header.textContent = headers[indexHeader].text;
            qrSection.appendChild(header);

            //Loop through the questions and display them in bold text
            for (
                var indexSubQuestion = 0;
                indexSubQuestion < headers[indexHeader].item.length;
                indexSubQuestion++
            ) {
                let line = renderQuestion(
                    headers[indexHeader].item[indexSubQuestion]
                );
                qrSection.appendChild(line);

                //jsonObj.resource.item[i].item[x].answer
                let answers =
                    headers[indexHeader].item[indexSubQuestion].answer;
                for (
                    var indexSubAnswer = 0;
                    indexSubAnswer < answers.length;
                    indexSubAnswer++
                ) {
                    //Loop through answers and append next to questions, multi-select are separated with commas
                    if (answers.length > 1) {
                        //On the last answer in multi-select, don't include a comma (stop at 2nd last)
                        if (indexSubAnswer <= answers.length - 2) {
                            let answer = renderMultiAnswer(
                                answers[indexSubAnswer]
                            );
                            line.appendChild(answer);
                        } else {
                            let answer = renderAnswer(answers[indexSubAnswer]);
                            line.appendChild(answer);
                        }
                    } else {
                        //Only 1 answer was received
                        let answer = renderAnswer(answers[indexSubAnswer]);
                        line.appendChild(answer);
                    }
                }
            }
        } // end of the Else containing all of the standard items / answers
    } // End of the indexHeader loop
}

/* Determines which type of value the object is holding then returns it as a string.
  Returns an empty string if it does not contain a supported type */
function getAnswerText(obj) {
    let {
        valueBoolean,
        valueDecimal,
        valueInteger,
        valueDate,
        valueDateTime,
        valueTime,
        valueString,
        valueUri,
        valueAttachment,
        valueCoding,
        valueQuantity
    } = obj;
    let response = '';

    if (typeof valueBoolean !== 'undefined') {
        response += valueBoolean;
    }

    if (typeof valueDecimal !== 'undefined') {
        response += valueDecimal;
    }

    if (typeof valueInteger !== 'undefined') {
        response += valueInteger;
    }

    if (typeof valueDate !== 'undefined') {
        response += valueDate;
    }

    if (typeof valueDateTime !== 'undefined') {
        response += valueDateTime;
    }

    if (typeof valueTime !== 'undefined') {
        response += valueTime;
    }

    if (typeof valueString !== 'undefined') {
        response += valueString;
    }

    if (typeof valueUri !== 'undefined') {
        response += valueUri;
    }

    if (typeof valueAttachment !== 'undefined') {
        response += valueAttachment;
    }

    if (typeof valueCoding !== 'undefined') {
        response += valueCoding;
    }

    if (typeof valueQuantity !== 'undefined') {
        response += valueQuantity;
    }

    return response;
}

/* Displays a question on the page by taking an object, creating a paragraph element,
styling it bold with a span, and then returning the question paragraph as an object,
verifies whether the last character of the question is a semi-colon, if not one is added */
function renderQuestion(obj) {
    let { text } = obj;
    let line = document.createElement('p');
    let question = document.createElement('span');
    question.classList.add('question');
    if (text.charAt(text.length - 1) == ':') {
        question.textContent = text + ' ';
    } else {
        question.textContent = text + ': ';
    }
    line.appendChild(question);

    return line;
}

/* Displays an answer on the page by taking an object, creating a span element with a
normal style applied, to remove any bolding, and then returns the answer as an object */
function renderAnswer(obj) {
    let answer = document.createElement('span');
    answer.classList.add('answer');
    answer.textContent = getAnswerText(obj);

    return answer;
}

/* Displays a Multi-line answer on the page by taking an object, creating a span element
with a normal style applied, to remove any bolding, adding a comma at the end, and then
returns the answer as an object */
function renderMultiAnswer(obj) {
    let answer = document.createElement('span');
    answer.textContent = getAnswerText(obj) + ', ';

    return answer;
}

// Remove the previous JSON data from the page so new data can be displayed
function clearJSONResults() {
    while (qrSection.firstChild) {
        qrSection.removeChild(qrSection.firstChild);
    }
}
