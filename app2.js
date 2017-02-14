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

var approveOrReject = function(session) {
    var i = session.userData.idx;
    var leaves = session.userData.leaves;
    var leave = leaves[i];
    session.beginDialog('/approveOrReject', leave);
}
bot.dialog('/', [
    function (session) {
        session.userData.leaves = [1, 2, 3, 4, 5];
        session.userData.idx = 0;
        approveOrReject(session);
    },
    function (session, results) {
        var i = parseInt(session.userData.idx);
        var leaves = session.userData.leaves;
        if(i < leaves.length - 1) {
            session.userData.idx = i + 1;
            approveOrReject(session);
        } else {
            session.send("That is all. Thank you.");
            session.endDialog();
        }
    }
]);
bot.dialog('/approveOrReject', [
    function (session2, args, next) {
        session2.dialogData.requestId = args;
        builder.Prompts.choice(session2, "Do you want to approve or reject this leave application ?", ['approve', 'reject'], {retryPrompt:'Sorry I dont understand. Please answer approve or reject'});
    },
    function (session2, results) {
        session2.dialogData.choice = results.response.entity.toLowerCase() || results.response.entity;
        if(session2.dialogData.choice == "1" || session2.dialogData.choice.indexOf("approve") != -1) {
            session2.send("Application id %s approved", session2.dialogData.requestId);
        } else {
            session2.send("Application id %s rejected", session2.dialogData.requestId);
        }
        session2.endDialogWithResult({ repsonse: session2.dialogData.requestId })
    },
]);



/*
var leaveApplication = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(leaveApplicationQuery).auth('vsdtechno2', 'external2').end(function(err, res){
            if (err || !res.ok) {
                return reject(err.status)
            } else {
                resolve(res.body);
            }
        });
    });
}
var checkLeave = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(leaveQuery).auth('vsdtechno', 'welcome1').end(function(err, res){
            if (err || !res.ok) {
                return reject(err.status)
            } else {
                resolve(res.body);
            }
        });
    });
}
var checkSale = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(leaveQuery).auth('acclim_app', 'Acclim@7').end(function(err, res){
            if (err || !res.ok) {
                return reject(err.status)
            } else {
                resolve(res.body);
            }
        });
    });
}
var checkPurchase = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(leaveQuery).auth('acclim_app', 'Acclim@7').end(function(err, res){
            if (err || !res.ok) {
                return reject(err.status)
            } else {
                resolve(res.body);
            }
        });
    });
}
var approveOrReject = function(session) {
    var i = session.userData.idx;
    var leaves = session.userData.leaves;
    var leave = leaves[i];
    var RequestId = leave.RequestId;
    var RequesterName = leave.RequesterName;
    var LeaveTypeDesc = leave.LeaveTypeDesc;
    var AbsenceHours = leave.AbsenceHours;
    var StartDate = leave.StartDate;
    var EndDate = leave.EndDate;
    StartDate = StartDate.replace("/Date(", "");
    StartDate = StartDate.replace(")/", "");
    EndDate = EndDate.replace("/Date(", "");
    EndDate = EndDate.replace(")/", "");
    StartDate = new Date(parseInt(StartDate));
    EndDate = new Date(parseInt(EndDate));
    StartDate = StartDate.toLocaleDateString();
    EndDate = EndDate.toLocaleDateString();
    var str = util.format("Leave request %d:\n\nRequester: %s\n\nLeave type: %s\n\nFrom: %s\n\nTo: %s\n\nTotal time: %s hours\n\n", i + 1, RequesterName, LeaveTypeDesc, StartDate, EndDate, AbsenceHours);
    session.send(str);
    session.beginDialog('/approveOrReject', leave);
}

var connector = new builder.ChatConnector
({ appId: '4287d7b4-aa06-4800-97a6-d842ef67733d', appPassword: 'yS8VVU9MD42EqwbR0LdCv9j' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
bot.dialog('/', [
    function (session) {
        leaveApplication(session.userData.uname, session.userData.pword).then((result) => {
            session.userData.leaves = result.d.results;
            session.userData.idx = 0;
            session.send("There are %d application needed to approve or reject.", result.d.results.length);
            approveOrReject(session);
        }).catch((err) => {
            if(err == 401) session.send("Unauthorized. Your username and password may be incorrect.");
            else session.send("Status is " + err + ". Unknown error. Server may have problem.");
            session.endDialog();
        });
    },
    function (session, results) {
        var i = parseInt(session.userData.idx);
        var leaves = session.userData.leaves;
        console.log(results.repsonse);
        session.send("Application %s with id %s processed", i + 1, results.repsonse);
        if(i < leaves.length - 1) {
            session.userData.idx = i + 1;
            approveOrReject(session);
        } else {
            session.send("That is all. Thank you.");
            session.endDialog();
        }
    }
]);
bot.dialog('/approveOrReject', [
    function (session2, args, next) {
        session2.dialogData.requestId = args.RequestId;
        builder.Prompts.choice(session2, "Do you want to approve or reject this leave application ?", ['approve', 'reject'], {retryPrompt:'Sorry I dont understand. Please answer approve or reject'});
    },
    function (session2, results) {
        session2.dialogData.choice = results.response.entity.toLowerCase() || results.response.entity;
        if(session2.dialogData.choice == "1" || session2.dialogData.choice.indexOf("approve") != -1) {
            session2.send("Application id %s approved", session2.dialogData.requestId);
        } else {
            session2.send("Application id %s rejected", session2.dialogData.requestId);
        }
        session2.endDialogWithResult({ repsonse: session2.dialogData.requestId })
    },
]);
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));*/