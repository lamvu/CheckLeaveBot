// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');
var request = require('superagent');
var ip = "https://webservices.acclimation.com.au:8543";//ECONREFUSED
//var ip = "https://10.0.0.82:8543";//IP does not amtch certificate altnames
//var ip = "https://10.0.0.82:8000";//error undefined
//var ip = "https://support.acclimation.com.au:8080";//ECONREFUSED
var query = ip + "/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";

var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

var searchHotels = function (destination) {
    return new Promise(function(resolve, reject) {
        request.get(query).auth('vsdtechno', 'welcome1').end(function(err, res){
            if (err || !res.ok) {
                return reject('ERROR')
            } else {
                //var result = JSON.stringify(res.body);
                resolve(res.body);
            }
        });
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

dialog.matches(/leave/i, function (session) {
    var destination = "1";
    searchHotels(destination).then((result) => {
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
        session.send("error: " + err);
        session.endDialog();
    });
});

dialog.onDefault(builder.DialogAction.send("I didn't understand. I can check leave for you."));
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));