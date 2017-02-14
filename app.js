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
var leaveApplication = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(leaveApplicationQuery).auth(uname, pword).end(function(err, res){
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
        request.get(leaveQuery).auth(uname, pword).end(function(err, res){
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
        request.get(leaveQuery).auth(uname, pword).end(function(err, res){
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
        request.get(leaveQuery).auth(uname, pword).end(function(err, res){
            if (err || !res.ok) {
                return reject(err.status)
            } else {
                resolve(res.body);
            }
        });
    });
}
var connector = new builder.ChatConnector
({ appId: '4287d7b4-aa06-4800-97a6-d842ef67733d', appPassword: 'yS8VVU9MD42EqwbR0LdCv9j' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c413b2ef-382c-45bd-8ff0-f76d60e2a821?subscription-key=97e730afe44640e49c5acbca0393a6dd&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);
bot.on('error', function (err) {
    console.log(err);
});
bot.use({
     botbuilder: function (session, next) {
          session.error = function (err) {
              session.send(err);
          };
          next(); 
     }
});
dialog.matchesAny([/hi/i, /hello/i, /good/i], [
    function (session) {
        builder.Prompts.text(session, "Hello. What is your name ?");
    },
    function (session, results) {
        session.send("Nice to meet you, %s", results.response);
        builder.Prompts.choice(session, 'What do you want to do to day ?', ['Leave Application', 'Sales Order', 'Purchase Order'], {retryPrompt:'Sorry I dont understand. Please answer again:'});
    },
    function (session, results) {
        session.userData.choice = results.response.entity.toLowerCase() || results.response.entity;
        if(session.userData.choice == '1' || session.userData.choice.indexOf('leave') != -1) {
            builder.Prompts.text(session, 'What is username to connect to database ?');
        } else if(session.userData.choice == '2' || session.userData.choice.indexOf('sale') != -1) {
            session.send("Sorry I cant answer you now. This function is not implemented yet");
            session.endDialog();

        } else if(session.userData.choice == '3' || session.userData.choice.indexOf('purchase') != -1) {
            session.send("Sorry I cant answer you now. This function is not implemented yet");
            session.endDialog();
        }
    },
    function (session, results) {
        session.userData.uname = results.response;
        builder.Prompts.text(session, 'What is password to connect to database ?');
    },
    function (session, results) {
        session.userData.pword = results.response;
        leaveApplicationProcess(session);
    },
]);
var leaveApplicationProcess = function (session) {
    if(session.userData.choice == '1' || session.userData.choice.indexOf('leave') != -1) {

        leaveApplication(session.userData.uname, session.userData.pword).then((result) => {
            console.log(result);
            var leaves = result.d.results;
            var i = 0;
            approveOrReject(leaves, i, session);
            session.send("HI");
            session.endDialog();
        }).catch((err) => {
            if(err == 401) session.send("Unauthorized. Your username and password may be incorrect.");
            else session.send("Status is " + err + ". Unknown error. Server may have problem.");
            session.endDialog();
        });

    } else if(session.userData.choice == '2' || session.userData.choice.indexOf('sale') != -1) {
        session.send("This function is not implemented yet");
        session.endDialog();

    } else if(session.userData.choice == '3' || session.userData.choice.indexOf('purchase') != -1) {
        session.send("This function is not implemented yet");
        session.endDialog();
    }
}
var approveOrReject = function(leaves, i, session) {
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
    //check
    if(i < leaves.length - 1) {
        approveOrReject(leaves, i + 1, session);
    } else {
        session.send("That is all. Thank you.");
        session.endDialog();
    }
    /*
    builder.Prompts.choice(session, "Do you want to approve or reject this leave application ?", ['approve', 'reject'], {retryPrompt:'Sorry I dont understand. Please answer approve or reject'});
    var subFunc = function (session, results) {
        if(results.response == '1' || results.response == 'approve') {
            //approve
            session.send("approve");
        } else {
            //reject
            session.send("reject");
        }
        //check
        if(i < leaves.length - 1) {
            approveOrReject(leaves, i + 1, session);
        } else {
            session.send("That is all. Thank you.");
            session.endDialog();
        }
    },*/
}
dialog.matches(/leave/i, [
    function (session) {
        builder.Prompts.text(session, 'What is username to connect to database ?');
    },
    function (session, results) {
        session.userData.uname = results.response;
        builder.Prompts.text(session, 'What is password to connect to database ?');
        //builder.Prompts.choice(session, 'What language do you code Node using? ', ['JavaScript', 'CoffeeScript', 'TypeScript']);
    },
    function (session, results) {
        session.userData.pword = results.response;
        console.log(session.userData.uname);
        console.log(session.userData.pword);
        checkLeave(session.userData.uname, session.userData.pword).then((result) => {
            var res = result.d.results[0];
            var typeName = res.TimeAccountTypeName;
            var unitName = res.TimeUnitName;
            var uQua = res.BalanceUsedQuantity;
            var pQua = res.BalancePlannedQuantity;
            var aQua = res.BalanceAvailableQuantity;
            var str = "You have used " + uQua + " days, planned " + pQua + " days, had " + aQua + " days leave";
            session.send(str);
            session.endDialog();
        }).catch((err) => {
            if(err == 401) session.send("Unauthorized. Your username and password may be incorrect.");
            else session.send("Status is " + err + ". Unknown error. Server may have problem.");
            session.endDialog();
        });
    }
]);
dialog.onDefault(builder.DialogAction.send("I didn't understand. I can check leave for you."));
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));