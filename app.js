var restify = require('restify'); 
var builder = require('botbuilder');
var request = require('superagent');
var LeaveApplication = require('./LeaveApplication');

var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
   console.log('%s listening to %s', server.name, server.url); 
});
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));
var connector = new builder.ChatConnector({ appId: '4287d7b4-aa06-4800-97a6-d842ef67733d', appPassword: 'yS8VVU9MD42EqwbR0LdCv9j' }); 
server.post('/api/messages', connector.listen());
//var bot = new builder.UniversalBot(connector);

var bot = new builder.UniversalBot(connector, [
    function (session) {
        var ask = true;
        if(session.userData.uname && session.userData.fail != 'yes') ask = false;
        if(ask) builder.Prompts.text(session, 'What is username to connect to database ?');
        else LeaveApplication.begin(session, session.userData);
    },
    function (session, results, next) {
        if(!results.note) {
            session.userData.uname = results.response;
            builder.Prompts.text(session, 'What is password to connect to database ?');
        } else next();
    },
    function (session, results, next) {
        if(!results.note) {
            session.userData.pword = results.response;
            LeaveApplication.begin(session, session.userData);
        } else next();
    },
    function (session, results) {
        if(results.note) {
            if(results.note == 'authorization failed') session.userData.fail = 'yes';
            else session.userData.fail = 'no';
            session.send(results.note);
        }
        session.send("We start again if you want. Tell me anything.");
        session.endDialog();
    },
]);

// Register Search Dialogs Library with bot
bot.library(LeaveApplication.create());