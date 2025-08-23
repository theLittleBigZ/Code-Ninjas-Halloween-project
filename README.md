# Code-Ninjas-Halloween-project

### JULIAN PERRI - N8N PROJECT WORKFLOW
On n8n, my part is designated to arranging the Google sheets and supplying all the information needed.

Information form<OnFormSubmission>
{
    FirstName<Text>:
    LastName<Text>:

    PhoneNumber<Number>:
    Email<Email>:
    How Many People Are Havin Their Photo Taken<Number{0-5}>:
}
--> AgreementForm<Form>
{
    [Text about the Terms and Conditions]
    Options<Agree/Disagree>:
}
--> CodeForFormattingDate<Code>
{
    return items.map(item => {
  const now = new Date();

  // Specify the formatting options
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'  // You can change this to your specific timezone
  };

  // Format the date and time
  const formatted = now.toLocaleString('en-US', options);

  // Add the formatted timestamp to the JSON
  item.json.timestamp = formatted;

  return item;
});
}
--> Append row in sheet
{
    Append UUID, FirstName, LastName, Email, Phone#, PhotoConsent, PhotoTaken, #OfPeople, SubmissionDate
} 
--> REST OF FORM NOT DEDICATED TO ME