# QuestionnaireResponse Parser

The QuestionnaireResponse formatter was created to help with debugging HL7 FHIR QuestionnaireResponse payloads, which hold ad-hoc structured data. This little tool hoped to solve the problem of helping to visualize the contents of a QuestionnaireResponse.item element in a way that might be displayed and read in an application by human beings.

Note that this tool is intended for a QuestionnaireResponse that does NOT reference a corresponding Questionnaire resource. Rather, all of the elements that a user needs to interpret the meaning of a data point (i.e., headers, question text, answer text) is included in the QuestionnaireResponse payload.

Learn more about QuestionnaireResponse and Questionnaire at the HL7 FHIR website.
