// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');
var request = require('superagent');
var query = "https://10.0.0.82:8543/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
request.auth('vsdtechno', 'welcome1', {type:'auto'})
request.get(query).end((err, res) => {
    if (err) { return reject('ERROR') }
    resolve('OK');
    console.log(res.body)
});

/*
var req = xmlhttp.XMLHttpRequest;
var request = new req();
var res = "hello";
var query = "http://10.0.0.82:8000/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
request.open("GET", query, true);
request.setRequestHeader("Authorization", "Basic " + hash);
request.onreadystatechange = function () {
    if (request.readyState == 4) {
        if (request.status == 200) {
            res = request.responseText;
            var obj = JSON.parse(res);
            var result = obj.d.results[0];
            var typeName = result.TimeAccountTypeName;
            var unitName = result.TimeUnitName;
            var uQua = result.BalanceUsedQuantity;
            var pQua = result.BalancePlannedQuantity;
            var aQua = result.BalanceAvailableQuantity;
            res = aQua;
            console.log(res);
        } else {
            console.log("2:"+request.statusText);
        }
    }
}
request.send();*/





/*
// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

var searchHotels = function (destination) {
    return new Promise(function(resolve, reject) {
        request.get('http://google.com').end((err, res) => {
            if (err) { return reject('ERROR') }
            resolve('OK');
            console.log(res.body)
        });
    });
}

var searchHotels = function (destination) {
    return new Promise(function (resolve) {
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var res = request.responseText;
                    var obj = JSON.parse(res);
                    var result = obj.d.results[0];
                    resolve(result);
                } else {
                    resolve(request);
                }
            }
        }
        request.send();
    });
}

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
    var destination = "1";
    searchHotels(destination).then((result) => {
        session.send(result);
        session.endDialog();
    });
});

dialog.onDefault(builder.DialogAction.send("I didn't understand. I can check leave for you."));
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));*/