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

var searchHotels = function (uname, pword) {
    return new Promise(function(resolve, reject) {
        request.get(query).auth(uname, pword).end(function(err, res){
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
var bot = new builder.UniversalBot(connector, function (session) {
    var address = session.message.address;
    userStore.push(address);

    // end current dialog
    session.endDialog('I can answer your leave queries ! It will start in a few seconds...');
});

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

setInterval(function () {
    var newAddresses = userStore.splice(0);
    newAddresses.forEach(function (address) {

        console.log('Starting session for user:', address);

        // new conversation address, copy without conversationId
        var newConversationAddress = Object.assign({}, address);
        delete newConversationAddress.conversation;

        // start survey dialog
        bot.beginDialog(newConversationAddress, 'survey', null, (err) => {
            if (err) {
                // error ocurred while starting new conversation. Channel not supported?
                bot.send(new builder.Message()
                    .text('This channel does not support this operation: ' + err.message)
                    .address(address));
            }
        });

    });
}, 5000);

bot.dialog('survey', [
    function (session) {
        builder.Prompts.text(session, 'Hello... What\'s your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.text(session, 'Hi ' + results.response + ', What is username to connect to database ?');
    },
    function (session, results) {
        session.userData.uname = results.response;
        builder.Prompts.text(session, 'Hi ' + results.response + ', What is password to connect to database ?');
        //builder.Prompts.choice(session, 'What language do you code Node using? ', ['JavaScript', 'CoffeeScript', 'TypeScript']);
    },
    function (session, results) {
        session.userData.pword = results.response.entity;
        searchHotels(session.userData.uname, session.userData.pword).then((result) => {
            var res = result.d.results[0];
            var typeName = res.TimeAccountTypeName;
            var unitName = res.TimeUnitName;
            var uQua = res.BalanceUsedQuantity;
            var pQua = res.BalancePlannedQuantity;
            var aQua = res.BalanceAvailableQuantity;
            var str = session.userData.name + ", you have used " + uQua + " days, planned " + pQua + " days, had " + aQua + " days leave";
            session.send(str);
            session.endDialog();
        }).catch((err) => {
            session.send("error: " + err);
            session.endDialog();
        });
        /*
        session.endDialog('Got it... ' + session.userData.name +
            ' you\'ve been programming for ' + session.userData.coding +
            ' years and use ' + session.userData.language + '.');*/
    }
]);



dialog.onDefault(builder.DialogAction.send("I didn't understand. I can check leave for you."));
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));