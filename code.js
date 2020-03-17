var searchbarValue;
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";


$("#search").on("click", function (event) {
    event.stopPropagation();
    searchbarValue = $("#searchbox").val();
    searchbarValue = searchbarValue.toString();
    buildUrl(searchbarValue, null,null);
})
function buildUrl(val, val2, val3) {
    let apiString;
    //if second value is null 
    if (val2 === null) {
        //search by city name
        var searchBy;
        if ($("#byName").is(':checked')) {
            searchBy = "q";
        }
        //search by zip
        else {
            searchBy = "zip";
        }
        apiString = "http://api.openweathermap.org/data/2.5/weather?" + searchBy + "=" + val + ",&appid=" + apiKey;
        requestData(apiString, 0);
    }
    else{
        apiString = "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + val + "&lon=" + val2
        requestData(apiString, 1)
        apiString = "http://api.openweathermap.org/data/2.5/forecast?&lat=" + val + "&lon=" + val2 +"&appid=" + apiKey
        requestData(apiString, 2)
        
   }
}
function requestData(apiUrl, x) {
            let infodump;
            let uvData;
            let forcast;
    $.ajax({
        url: apiUrl,
        method: "GET"
    })
        .then(function (response) {
            
            if (x === 0) {
                infodump = response;
                let lat = infodump.coord.lat;
                let long = infodump.coord.lon;
                buildUrl(lat, long, null)
            }
            else if(x === 1){
                uvData = response;
                
            }
            else{
                forcast = response
                getinfo(infodump,uvData,forcast)
            }


        });
}
function getinfo(current,uv,fiveDay){
    infodump.weather[0].main
    infodump.weather[0].description
    infodump.main.temp
    infodump.main.feels_like
    infodump.main.temp_max
    infodump.main.temp_min
    infodump.main.humidity
}
function currentWeather(){
    $("#current").html(`
    
    `)
}