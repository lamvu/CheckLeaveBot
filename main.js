var btoa = require('btoa');
var xmlhttp = require("xmlhttprequest");
var parseString = require('xml2js').parseString;
var token = "vsdtechno:welcome1";
var hash = btoa(token);
var req = xmlhttp.XMLHttpRequest;
var request = new req();
/*
var query = "http://10.0.0.82:8000/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName";
request.open("GET", query, true);
request.setRequestHeader("Authorization", "Basic " + hash);
request.onreadystatechange = function () {
    if (request.readyState == 4) {
        if (request.status == 200) {
            var res = request.responseText;
            parseString(res, function (err, result) {
                var a = result.feed.entry[0];
                var b = a.content[0];
                var c = b["m:properties"][0];
                var typeName = c["d:TimeAccountTypeName"][0];
                var unitName = c["d:TimeUnitName"][0];
                var uQua = c["d:BalanceUsedQuantity"][0];
                var pQua = c["d:BalancePlannedQuantity"][0];
                var aQua = c["d:BalanceAvailableQuantity"][0];
                console.log(typeName);
                console.log(unitName);
                console.log(uQua);
                console.log(pQua);
                console.log(aQua);
            });
        } else {
            console.log("2:"+request.statusText);
        }
    }
}
request.send();*/
var query = "http://10.0.0.82:8000/sap/opu/odata/GBHCM/LEAVEREQUEST;v=2/AbsenceTypeCollection(EmployeeID='',StartDate=datetime'2016-12-13T00%3A00%3A00',AbsenceTypeCode='0100')/absenceTypeTimeAccount?$select=BalancePlannedQuantity,BalanceAvailableQuantity,BalanceUsedQuantity,TimeUnitName,TimeAccountTypeName&$format=json";
request.open("GET", query, true);
request.setRequestHeader("Authorization", "Basic " + hash);
request.onreadystatechange = function () {
    if (request.readyState == 4) {
        if (request.status == 200) {
            var res = request.responseText;
            var obj = JSON.parse(res);
            var result = obj.d.results[0];
            var typeName = result.TimeAccountTypeName;
            var unitName = result.TimeUnitName;
            var uQua = result.BalanceUsedQuantity;
            var pQua = result.BalancePlannedQuantity;
            var aQua = result.BalanceAvailableQuantity;
            console.log(result);
            console.log(aQua);
            /*
            parseString(res, function (err, result) {
                var a = result.feed.entry[0];
                var b = a.content[0];
                var c = b["m:properties"][0];
                var typeName = c["d:TimeAccountTypeName"][0];
                var unitName = c["d:TimeUnitName"][0];
                var uQua = c["d:BalanceUsedQuantity"][0];
                var pQua = c["d:BalancePlannedQuantity"][0];
                var aQua = c["d:BalanceAvailableQuantity"][0];
                console.log(typeName);
                console.log(unitName);
                console.log(uQua);
                console.log(pQua);
                console.log(aQua);
            });*/
        } else {
            console.log("2:"+request.statusText);
        }
    }
}
request.send();