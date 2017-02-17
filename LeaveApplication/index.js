var util = require('util');
var odata = require('../odata');
var builder = require('botbuilder');

var leaveApplicationQuery = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/LeaveRequestCollection?$skip=0&$top=100&$orderby=ChangeDate desc&" + 
	"$filter=FilterGetAllRequests eq 1 and TaskDefinitionID eq ''&$inlinecount=allpages&$format=json";
var leaveApplicationApprove = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/ApplyLeaveRequestDecision?SAP__Origin='IDE_800'&" + 
	"RequestId='005056B971CA1ED6BBB2EB456DF395BF'&Version=1&Comment='Yes Holiday.'&Decision='PREPARE_APPROVE'";
var leaveApplicationReject = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/ApplyLeaveRequestDecision?SAP__Origin='IDE_800'&" + 
	"RequestId='005056B971CA1ED6BBB2EB456DF395BF'&Version=1&Comment='Yes Holiday.'&Decision='PREPARE_REJECT'";

var leaves = [1, 2, 3];
var idx = 0;


function create() {
    const library = new builder.Library('leaveApplication');
    library.dialog('/', [
    	function (session, args, next) {
    		odata.connect(args.uname, args.pword).then((result) => {
    			odata.get(leaveApplicationQuery).then((result) => {
    				leaves = result.d.results;
    				idx = 0;
    				session.send("There are %d application needed to approve or reject.", result.d.results.length);
    				session.beginDialog('check');
          }).catch((err) => {
          	session.send(err);
          	session.endDialogWithResult({note: "error with getting leave application"});
          });
    		}).catch((err) => {
    			session.send(err);
    			session.endDialogWithResult({note: "authorization failed"});
    		});
    	},
	    function (session, results) {
	        session.send(results.repsonse);
	        idx = 0;
	        session.endDialogWithResult({note: "No more data."});
	    }
    ]);
    library.dialog('check', new builder.SimpleDialog(function (session, results) {
	    if (results && results.response) {
	    	var leave = leaves[idx];
	    	var RequestId = leave.RequestId;
	    	var postData = {RequestId: RequestId};
        if(results.response.index == 0 || results.response.entity == "approve") {
        	odata.post(leaveApplicationApprove, postData).then((result) => {
        		console.log(result);
        		session.send("Application %s approved", RequestId);
		        idx += 1;
		        processLeaveApplication(session);
          }).catch((err) => {
          	session.send(err);
		        idx += 1;
		        processLeaveApplication(session);
          });
        } else if(results.response.index == 1 || results.response.entity == "reject") {
        	odata.post(leaveApplicationReject, postData).then((result) => {
        		console.log(result);
        		session.send("Application %s rejected", RequestId);
		        idx += 1;
		        processLeaveApplication(session);
          }).catch((err) => {
          	session.send(err);
		        idx += 1;
		        processLeaveApplication(session);
          });
        } else {
        	session.send("Application %s is decided later", RequestId);
        	idx += 1;
        	processLeaveApplication(session);
        }
	    } else processLeaveApplication(session);
    }));
    return library.clone();
}
function begin(session, args) {
	session.beginDialog('leaveApplication:/', args);
}
function check(session, args) {
	session.beginDialog('leaveApplication:check', args);
}
function processLeaveApplication(session) {
	if(idx < leaves.length) {
		var leave = leaves[idx];
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
		var str = util.format("Leave request %d:\n\nRequester: %s\n\nLeave type: %s\n\nFrom: %s\n\nTo: %s\n\nTotal time: %s hours\n\n", idx + 1, RequesterName, LeaveTypeDesc, StartDate, EndDate, AbsenceHours);
		session.send(str);
		builder.Prompts.choice(session, 'Do you want to approve or reject this leave application or decided later ?', ['approve', 'reject', 'decided later'], {retryPrompt:'Sorry I dont understand. Please answer again:'});
	} else session.endDialogWithResult({ repsonse: "that is done" });
}
module.exports = {
    create: create,
    begin: begin,
    check: check
};