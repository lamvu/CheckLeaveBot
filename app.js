// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 

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
// Add intent handlers
dialog.matches('builtin.intent.alarm.set_alarm', builder.DialogAction.send('Creating Alarm'));
dialog.matches('builtin.intent.alarm.delete_alarm', builder.DialogAction.send('Deleting Alarm'));
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));




/*
// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello World");
});*/
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));