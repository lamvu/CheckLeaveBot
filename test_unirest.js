var unirest = require('unirest');
var ip = "https://webservices.acclimation.com.au:8543/";
var leaveApplicationQuery = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/LeaveRequestCollection?$skip=0&$top=100&$orderby=ChangeDate desc&" + 
    "$filter=FilterGetAllRequests eq 1 and TaskDefinitionID eq ''&$inlinecount=allpages&$format=json";
var leaveApplicationApprove = "sap/opu/odata/GBHCM/LEAVEAPPROVAL;mo/ApplyLeaveRequestDecision?SAP__Origin='IDE_800'&" + 
    "RequestId='005056B971CA1ED6BBB2EB456DF395BF'&Version=1&Comment='Yes Holiday.'&Decision='PREPARE_APPROVE'";
var Request = unirest.post(ip + leaveApplicationApprove);
Request.auth({
  user: 'vsdtechno2',
  pass: 'external2',
});
Request.header('x-csrf-token', 'k0y4Bq17j5Al0eBUTXoX-Q==');
/*
Request.headers({
  'Accept': 'application/json',
  'User-Agent': 'Unirest Node.js',
  'x-csrf-token': 'hG6bjWoZ08Pz251-hssA8w==',
});*/
Request.send({ "parameter": 23, "foo": "bar" })
Request.end(function (response) {
  console.log(response);
});