var util = require('util');
var odata = require('../odata');
var builder = require('botbuilder');

var leaveApplicationQuery = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/LeaveRequestCollection?$skip=0&$top=100&$orderby=ChangeDate desc&" + 
	"$filter=FilterGetAllRequests eq 1 and TaskDefinitionID eq ''&$inlinecount=allpages&$format=json";
var leaveApplicationApprove = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/ApplyLeaveRequestDecision?SAP__Origin='IDE_800'&" + 
	"RequestId='005056B971CA1ED6BBB2EB456DF395BF'&Version=1&Comment='Yes Holiday.'&Decision='PREPARE_APPROVE'";
var leaveApplicationReject = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/ApplyLeaveRequestDecision?SAP__Origin='IDE_800'&" + 
	"RequestId='005056B971CA1ED6BBB2EB456DF395BF'&Version=1&Comment='Yes Holiday.'&Decision='PREPARE_REJECT'";

var po1 = "sap/opu/odata/sap/ZPO_RELEASE_SRV/PurchaseOrders?$filter=ReleaseCode eq '01'&$format=json";
var po2 = "sap/opu/odata/sap/ZPO_RELEASE_SRV/PurchaseOrders?$filter=ReleaseCode eq '02'&$format=json";

var leaves = [];
var pos1 = [];
var pos2 = [];
var pos = [];
var idx = 0;
var idp = 0;

function create() {
    const library = new builder.Library('leaveApplication');
    library.dialog('/', [
    	function (session, args, next) {
    		session.sendTyping();
    		odata.connect(args.uname, args.pword).then((result) => {
    			odata.get(leaveApplicationQuery).then((result) => {
    				leaves = result.d.results;
    				idx = 0;
    				//session.send("There are %d application needed to approve or reject.", leaves.length);
    				//session.beginDialog('check');
    				odata.get2(po1).then((result) => {
	    				pos1 = result.d.results;
	    				odata.get2(po2).then((result) => {
		    				pos2 = result.d.results;
		    				pos = pos1.concat(pos2);
		    				idp = 0;
		    				session.send("There are %d leave applications and %d purchase orders needed to approve or reject.", leaves.length, pos.length);
		    				builder.Prompts.choice(session, "Do you want to process leave applications and purchase orders ?", ['leave applications', 'purchase orders'], {retryPrompt:'Sorry I dont understand. Please answer approve or reject'});
		          }).catch((err) => {
		          	session.send(err);
		          });
	          }).catch((err) => {
	          	session.send(err);
	          });
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
	    	if(results.response.index == 0 || results.response.entity == "leave applications") {
	    		session.beginDialog('check');
        } else {
        	session.beginDialog('purchaseOrder');
        }
	    },
	    function (session, results) {
        session.send(results.repsonse);
        idx = 0;
        idp = 0;
        session.endDialogWithResult({note: "Finish processing."});
	    }
    ]);
    library.dialog('check', new builder.SimpleDialog(function (session, results) {
	    if (results && results.response) {
	    	var leave = leaves[idx];
	    	var RequestId = leave.RequestId;
	    	var postData = {RequestId: RequestId};
        if(results.response.index == 0 || results.response.entity == "approve") {
      		session.send("Application %s approved", RequestId);
	        idx += 1;
	        processLeaveApplication(session);
        } else if(results.response.index == 1 || results.response.entity == "reject") {
      		session.send("Application %s rejected", RequestId);
	        idx += 1;
	        processLeaveApplication(session);
        } else {
        	session.send("Application %s is decided later", RequestId);
        	idx += 1;
        	processLeaveApplication(session);
        }
	    	/*
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
        }*/
	    } else processLeaveApplication(session);
    }));
    library.dialog('purchaseOrder', new builder.SimpleDialog(function (session, results) {
	    if (results && results.response) {
	    	var po = pos[idp];
	    	var PurchaseOrderNumber = po.PurchaseOrderNumber;
	    	var postData = {PurchaseOrderNumber: PurchaseOrderNumber};
        if(results.response.index == 0 || results.response.entity == "approve") {
      		session.send("Order %s approved", PurchaseOrderNumber);
	        idp += 1;
	        processPurchaseOrder(session);
        } else if(results.response.index == 1 || results.response.entity == "reject") {
      		session.send("Order %s rejected", PurchaseOrderNumber);
	        idp += 1;
	        processPurchaseOrder(session);
        } else {
        	session.send("Order %s is decided later", PurchaseOrderNumber);
        	idp += 1;
        	processPurchaseOrder(session);
        }
	    	/*
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
        }*/
	    } else processPurchaseOrder(session);
    }));
    return library.clone();
}
function begin(session, args) {
	session.beginDialog('leaveApplication:/', args);
}
function check(session, args) {
	session.beginDialog('leaveApplication:check', args);
}
function purchaseOrder(session, args) {
	session.beginDialog('leaveApplication:purchaseOrder', args);
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
function processPurchaseOrder(session) {
	if(idp < pos.length) {
		var po = pos[idp];
		var PurchaseOrderNumber = po.PurchaseOrderNumber;
		var VendorName = po.VendorName;
		var Total = po.Total;
		var DocumentDate = po.DocumentDate;
		DocumentDate = DocumentDate.replace("/Date(", "");
		DocumentDate = DocumentDate.replace("/Date(", "");
		DocumentDate = new Date(parseInt(DocumentDate));
		DocumentDate = DocumentDate.toLocaleDateString();
		var str = util.format("Purchase Order %d:\n\nPO Number: %s\n\nVendor: %s\n\nTotal: %s\n\nDate: %s\n\n\n\n", idp + 1, PurchaseOrderNumber, VendorName, Total, DocumentDate);
		session.send(str);
		builder.Prompts.choice(session, 'Do you want to approve or reject this purchase order or decided later ?', ['approve', 'reject', 'decided later'], {retryPrompt:'Sorry I dont understand. Please answer again:'});
	} else session.endDialogWithResult({ repsonse: "that is done" });
}
module.exports = {
    create: create,
    begin: begin,
    check: check,
    purchaseOrder: purchaseOrder
};