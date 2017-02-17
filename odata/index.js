var request = require('superagent');

var ip = "https://webservices.acclimation.com.au:8543/";
var leaveQuery = "sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
var leaveApplicationQuery = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/LeaveRequestCollection?$skip=0&$top=100&$orderby=ChangeDate desc&$filter=FilterGetAllRequests eq 1 and TaskDefinitionID eq ''&$inlinecount=allpages&$format=json";
var uname;
var pword;
var token;
function connect(user, pass) {
	return new Promise(function(resolve, reject) {
		request.get(ip + leaveQuery).auth(user, pass).set('x-csrf-token', 'fetch').end(function(err, result){
			if (err) {
				var res = err.response;
				var mes1;
				var mes2;
				var mes = "";
				try {
					var json = JSON.parse(res.text);
					var mes1 = json.error.message.value;
					var mes2 = json.error.innererror.errordetails[0].message;
				} catch(error) {
					if(res.text.indexOf("<html>") != -1) {
						if(err.status == 401) mes1 = "Maybe wrong user/pass";
					} else mes1 = res.text;
				}
				if(err.status == 401) mes = "Unauthorized. ";
				else mes = "Status is " + err.status + ". ";
  			if(mes1 && mes2) mes += (mes1 + mes2);
  			else if(mes1) mes += mes1;
				return reject(mes);
			} else {
				uname = user;
				pword = pass;
				token = result.headers['x-csrf-token'];
				resolve(result.body);
			}
		});
	});
}
function get(query) {
	return new Promise(function(resolve, reject) {
		request.get(ip + query).auth(uname, pword).end(function(err, result){
			if (err) {
				var res = err.response;
				var mes1;
				var mes2;
				var mes = "";
				try {
					var json = JSON.parse(res.text);
					mes1 = json.error.message.value;
					mes2 = json.error.innererror.errordetails[0].message;
				} catch(error) {
					if(err.status == 401) mes = "Maybe wrong user/pass";
				}
				if(err.status == 401) mes = "Unauthorized. ";
				else mes = "Status is " + err.status + ". ";
  			if(mes1 && mes2) mes += (mes1 + mes2);
  			else if(mes1) mes += mes1;
				return reject(mes);
			} else {
				resolve(result.body);
			}
		});
	});
}
function post(query, data) {
	return new Promise(function(resolve, reject) {
		request.post(ip + query).set('x-csrf-token', token).auth(uname, pword).send(data).end(function(err, result){
			if (err) {
				var res = err.response;
				var mes1;
				var mes2;
				var mes = "";
				try {
					var json = JSON.parse(res.text);
					var mes1 = json.error.message.value;
					var mes2 = json.error.innererror.errordetails[0].message;
				} catch(error) {
					if(res.text.indexOf("<html>") != -1) {
						if(err.status == 401) mes1 = "Maybe wrong user/pass";
					} else mes1 = res.text;
				}
				if(err.status == 401) mes = "Unauthorized. ";
				else mes = "Status is " + err.status + ". ";
  			if(mes1 && mes2) mes += (mes1 + mes2);
  			else if(mes1) mes += mes1;
				return reject(mes);
			} else {
				resolve(result.body);
			}
		});
	});
}
module.exports = {
    connect: connect,
    get: get,
    post: post
};