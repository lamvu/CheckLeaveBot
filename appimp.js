var util = require('util');
var restify = require('restify'); 
var builder = require('botbuilder');
var request = require('superagent');
var ip = "https://webservices.acclimation.com.au:8543";//ECONREFUSED
var leaveQuery = ip + "/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
var leaveApplicationQuery = ip + "/sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/LeaveRequestCollection?$skip=0&$top=100&$orderby=ChangeDate desc&$filter=FilterGetAllRequests eq 1 and TaskDefinitionID eq ''&$inlinecount=allpages&$format=json";

var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
   console.log('%s listening to %s', server.name, server.url); 
});
var connector = new builder.ChatConnector({ appId: '4287d7b4-aa06-4800-97a6-d842ef67733d', appPassword: 'yS8VVU9MD42EqwbR0LdCv9j' }); 
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

var leaves = [1, 2, 3, 4, 5];
var idx = 0;
bot.dialog('/', [
    function (session) {
        builder.Prompts.confirm(session, "Hi, do you want to start now ?");
    },
    function (session, results) {
        if(results.response) session.beginDialog('/check');
        else session.send("Please chat with me any time you want");
    },
    function (session, results) {
        session.send(results.repsonse);
        idx = 0;
        session.send("That is all. Thank you.");
    }
]);

bot.dialog('/check', new builder.SimpleDialog(function (session, results) {
    if (results && results.response) {
        if(results.response.entity == "1" || results.response.entity == "approve") {
            session.send("approve");
        } else session.send("reject");
        idx += 1;
    }
    if(idx < leaves.length) {
        session.send("leave application %d", leaves[idx]);
        builder.Prompts.choice(session, "Do you want to approve or reject this leave application ?", ['approve', 'reject'], {retryPrompt:'Sorry I dont understand. Please answer approve or reject'});
    } else {
        //session end
        session.endDialogWithResult({ repsonse: "that is done" });
    }
}));