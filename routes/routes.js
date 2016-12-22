var appRouter = function(app) {

  var https = require('https');
  app.get("/", function(req, res) {
      res.send("Hello World");
  });

  app.post("/branch", function(req, res) {
      var branchResponse =
        {
        "speech": "Barack Hussein Obama II is the 44th and current President of the United States.",
        "displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
        "data": {},
        "contextOut": [],
        "source": "DuckDuckGo"
        }
      res.send(branchResponse);
  });

  app.post("/branchlocator", function(req, res) {

      var zip = "94587";
      getJsonFromBranchLocator(zip, function(data){
        if(data.GetListATMorBranchReply.BranchList.length == 0)
          {
              spokenMsg = "<speak>The zip code <say-as interpret-as=\"digits\">" + zip +
                  "</say-as> does not have any nearby branches.</speak>";
              cardMsg = "The zip code " + zip + " does not have any nearby branches.";

              response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
              return;
          }

          var branchName = data.GetListATMorBranchReply.BranchList[0].Name.replace("&", "and");
          var distance = data.GetListATMorBranchReply.BranchList[0].Distance + " miles";
          var streetAddress = data.GetListATMorBranchReply.BranchList[0].LocationIdentifier.Address.AddressLine1.replace("&", "and");
          var closingTime = getBranchClosingTimeForToday(data.GetListATMorBranchReply.BranchList[0]);

          spokenMsg = "<speak>The closest Branch to the <say-as interpret-as=\"digits\">" + zip +
                  "</say-as> zip code is the " + branchName + " location. It's located " + distance +
                  " away at " + streetAddress + ". " +
                  "The branch closes this evening at " + closingTime + ".</speak>";

          cardMsg = "The closest Branch to the " + zip + " zip code is the "
                  + branchName + " location. It's located " + distance + " away at " + streetAddress + ". " +
                  "The branch closes this evening at " + closingTime + ".";

          var branchResponse =
                    {
                    "speech": cardMsg,
                    "displayText": "",
                    "data": {},
                    "contextOut": [],
                    "source": "U.S Bank"
                    }

          //response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
          res.send(branchResponse);
          return;
       });
  });

  var url = function(zip){
    return "https://publicrestservice.usbank.com/public/ATMBranchLocatorRESTService_V_8_0/GetListATMorBranch/LocationSearch/" +
                    "StringQuery?application=parasoft&transactionid=cb6b8ea5-3331-408c-9ab3-58e18f2e5f95&output=json&searchtype=E&" +
                    "stringquery=" + zip + "&branchfeatures=BOP&maxitems=1&radius=5";
    //return "https://branchservice.herokuapp.com/";
};

var getJsonFromBranchLocator = function (zip, callback){
  var t0 = new Date().getTime();
    https.get(url(zip), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var t1 = new Date().getTime();
      console.log("Call to service took " + (t1 - t0) + " milliseconds.");
      //var result = body;
      var result = JSON.parse(body);
      return callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

var getBranchClosingTimeForToday = function(branch){

    var d = new Date().getDay();
    var time = "";

    if(d == 0)
        time = branch.OperationalHours.Sunday.ClosingTime;
    else if(d == 1)
        time =  branch.OperationalHours.Monday.ClosingTime;
    else if(d == 2)
        time =  branch.OperationalHours.Tuesday.ClosingTime;
    else if(d == 3)
        time =  branch.OperationalHours.Wednesday.ClosingTime;
    else if(d == 4)
        time =  branch.OperationalHours.Thursday.ClosingTime;
    else if(d == 5)
        time =  branch.OperationalHours.Friday.ClosingTime;
    else if(d == 6)
        time =  branch.OperationalHours.Saturday.ClosingTime;

    var hour = time.substr(0, 2);
    var minutes = time.substr(3, 2);

    if(hour > 12)
        return (hour - 12) + ":" + minutes + " PM";
    if(hour == 12)
        return hour + ":" + minutes + "PM";
    if(hour < 12)
        return hour + ":" + minutes + "AM";
};

  app.get("/account", function(req, res) {
    var accountMock = {
        "username": "nraboy",
        "password": "1234",
        "twitter": "@nraboy"
    }
    if(!req.query.username) {
        return res.send({"status": "error", "message": "missing username"});
    } else if(req.query.username != accountMock.username) {
        return res.send({"status": "error", "message": "wrong username"});
    } else {
        return res.send(accountMock);
    }
});

}

module.exports = appRouter;
