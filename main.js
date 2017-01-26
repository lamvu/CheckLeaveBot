// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');

var btoa = require('btoa');
var xmlhttp = require("xmlhttprequest");
var token = "vsdtechno:welcome1";
var hash = btoa(token);
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
request.send();