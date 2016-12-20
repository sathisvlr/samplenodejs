var appRouter = function(app) {

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

            //response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
            res.send(spokenMsg);
       });
  });

  var url = function(zip){
    return "https://publicrestservice.usbank.com/public/ATMBranchLocatorRESTService_V_8_0/GetListATMorBranch/LocationSearch/" +
                    "StringQuery?application=parasoft&transactionid=cb6b8ea5-3331-408c-9ab3-58e18f2e5f95&output=json&searchtype=E&" +
                    "stringquery=" + zip + "&branchfeatures=BOP";
  };

  var getJsonFromBranchLocator = function (zip, callback){
      https.get(url(zip), function(res){
      var body = '';

      res.on('data', function(data){
        body += data;
      });

      res.on('end', function(){
        var result = JSON.parse(body);
        callback(result);
      });

    }).on('error', function(e){
      console.log('Error: ' + e);
    });
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
