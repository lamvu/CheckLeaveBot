// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');

var btoa = require('btoa');
var xmlhttp = require("xmlhttprequest");
var token = "vsdtechno:welcome1";
var hash = btoa(token);
var req = xmlhttp.XMLHttpRequest;
var request = new req();
var res = "hello";
//var query = "https://webservices.acclimation.com.au:8543/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
var query = "https://10.0.0.82:8543/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
request.open("GET", query, true);
request.setRequestHeader("Authorization", "Basic " + hash);

var searchHotels = function (destination) {
    return new Promise(function (resolve) {
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var res = request.responseText;
                    var obj = JSON.parse(res);
                    var result = obj.d.results[0];
                    var typeName = result.TimeAccountTypeName;
                    var unitName = result.TimeUnitName;
                    var uQua = result.BalanceUsedQuantity;
                    var pQua = result.BalancePlannedQuantity;
                    var aQua = result.BalanceAvailableQuantity;
                    resolve(result);
                } else {
                    resolve(request);
                }
            }
        }
        request.send();
    });
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector
({ appId: '4287d7b4-aa06-4800-97a6-d842ef67733d', appPassword: 'yS8VVU9MD42EqwbR0LdCv9j' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c413b2ef-382c-45bd-8ff0-f76d60e2a821?subscription-key=97e730afe44640e49c5acbca0393a6dd&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);
/*
bot.on('error', function (err) {
    console.log(err);
});*/
bot.use({
     botbuilder: function (session, next) {
          session.error = function (err) {
              session.send(err);
          };
          next(); 
     }
});
// Add intent handlers
dialog.matchesAny([/hi/i, /hello/i, /good/i], [
    function (session) {
        builder.Prompts.text(session, "Hello. What is your name ?");
    },
    function (session, results) {
        session.send("Nice to meet you, %s", results.response);
    }
]);

dialog.matches(/^version/i, function (session) {
    session.send('Bot version 1.2');
});

dialog.matches(/^leave/i, function (session) {
    /*
    var destination = "1";
    searchHotels(destination).then((result) => {
        if(result.status) session.send(result.status);
        var typeName = result.TimeAccountTypeName;
        var unitName = result.TimeUnitName;
        var uQua = result.BalanceUsedQuantity;
        var pQua = result.BalancePlannedQuantity;
        var aQua = result.BalanceAvailableQuantity;
        var str = "You have used " + uQua + " days, planned " + pQua + " days, had " + aQua + " days leave";
        session.send(str);
        session.endDialog();
    });
    session.sendTyping();
    lookupItemsAsync(function (results) {
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var res = request.responseText;
                    var obj = JSON.parse(res);
                    var result = obj.d.results[0];
                    var typeName = result.TimeAccountTypeName;
                    var unitName = result.TimeUnitName;
                    var uQua = result.BalanceUsedQuantity;
                    var pQua = result.BalancePlannedQuantity;
                    var aQua = result.BalanceAvailableQuantity;
                    session.send(aQua);
                } else {
                    console.log("2:"+request.statusText);
                }
            }
        }
        request.send();
    });*/
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                session.send("HA");
                var res = request.responseText;
                var obj = JSON.parse(res);
                var result = obj.d.results[0];
                var typeName = result.TimeAccountTypeName;
                var unitName = result.TimeUnitName;
                var uQua = result.BalanceUsedQuantity;
                var pQua = result.BalancePlannedQuantity;
                var aQua = result.BalanceAvailableQuantity;
                var str = "You have used " + uQua + " days, planned " + pQua + " days, had " + aQua + " days leave";
                session.send(res);
            } else {
                session.send("CROS problem with status "+request.status);
            }
        }
    }
    request.send();
});

dialog.onDefault(builder.DialogAction.send("I didn't understand. I can check leave for you."));
/*
dialog.matches('builtin.intent.alarm.set_alarm', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var title = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
        var time = builder.EntityRecognizer.resolveTime(args.entities);
        var alarm = session.dialogData.alarm = {
          title: title ? title.entity : null,
          timestamp: time ? time.getTime() : null  
        };
        
        // Prompt for title
        if (!alarm.title) {
            builder.Prompts.text(session, 'What would you like to call your alarm?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var alarm = session.dialogData.alarm;
        if (results.response) {
            alarm.title = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (alarm.title && !alarm.timestamp) {
            builder.Prompts.time(session, 'What time would you like to set the alarm for?');
        } else {
            next();
        }
    },
    function (session, results) {
        var alarm = session.dialogData.alarm;
        if (results.response) {
            var time = builder.EntityRecognizer.resolveTime([results.response]);
            alarm.timestamp = time ? time.getTime() : null;
        }
        
        // Set the alarm (if title or timestamp is blank the user said cancel)
        if (alarm.title && alarm.timestamp) {
            // Save address of who to notify and write to scheduler.
            alarm.address = session.message.address;
            alarms[alarm.title] = alarm;
            
            // Send confirmation to user
            var date = new Date(alarm.timestamp);
            var isAM = date.getHours() < 12;
            session.send('Creating alarm named "%s" for %d/%d/%d %d:%02d%s',
                alarm.title,
                date.getMonth() + 1, date.getDate(), date.getFullYear(),
                isAM ? date.getHours() : date.getHours() - 12, date.getMinutes(), isAM ? 'am' : 'pm');
        } else {
            session.send('Ok... no problem.');
        }
    }
]);

dialog.matches('builtin.intent.alarm.delete_alarm', [
    function (session, args, next) {
        // Resolve entities passed from LUIS.
        var title;
        var entity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
        if (entity) {
            // Verify its in our set of alarms.
            title = builder.EntityRecognizer.findBestMatch(alarms, entity.entity);
        }
        
        // Prompt for alarm name
        if (!title) {
            builder.Prompts.choice(session, 'Which alarm would you like to delete?', alarms);
        } else {
            next({ response: title });
        }
    },
    function (session, results) {
        // If response is null the user canceled the task
        if (results.response) {
            delete alarms[results.response.entity];
            session.send("Deleted the '%s' alarm.", results.response.entity);
        } else {
            session.send('Ok... no problem.');
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));
*/



/*
// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello World");
});*/
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));