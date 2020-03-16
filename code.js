var searchbarValue;
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";
var apiUrl;
var infodump;
$("#search").on("click", function (event) {
    event.stopPropagation();
    searchbarValue = $("#searchbox").val();
    searchbarValue = searchbarValue.toString();
    buildUrl(searchbarValue);
})
function buildUrl(val) {
    //search by city name
    if ($("#byName").is(':checked')) {
        apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + val + "&appid=" + apiKey;
    }
    //search by zip
    else {
        apiUrl = "http://api.openweathermap.org/data/2.5/weather?zip=" + val + ",&appid=" + apiKey;
    }
    requestData();
}
function requestData() {
    $.ajax({
        url: apiUrl,
        method: "GET"
    })
        .then(function (response) {
            infodump = response;
            

            

        });
}