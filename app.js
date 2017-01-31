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
}));