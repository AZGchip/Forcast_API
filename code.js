var searchbarValue;
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";
var infodump;
var metric = 0;

$("#search").on("click", function (event) {
    event.stopPropagation();
    searchbarValue = $("#searchbox").val();
    searchbarValue = searchbarValue.toString();
    buildUrl(searchbarValue, null, null);
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
    else {
        apiString = "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + val + "&lon=" + val2
        requestData(apiString, 1)
        apiString = "http://api.openweathermap.org/data/2.5/forecast?&lat=" + val + "&lon=" + val2 + "&appid=" + apiKey
        requestData(apiString, 2)

    }
}
function requestData(apiUrl, x) {

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
            else if (x === 1) {
                uvData = response;

            }
            else {
                forcast = response
                getinfo(infodump, uvData, forcast)
            }


        });
}
function getinfo(current, uv, fiveDay) {
    let cityName = current.name
    let weather = current.weather[0].main
    let weatherDesc = current.weather[0].description
    let temp;
    let feels;
    let high;
    let low;
    let unit;
    let humidity = Math.round(infodump.main.humidity) + "%"
    let wind = current.wind;
    if (metric) {
        temp = toCelsius(infodump.main.temp) 
        feels = toCelsius(infodump.main.feels_like)  
        high = toCelsius(infodump.main.temp_max) 
        low = toCelsius(infodump.main.temp_min) 
        unit = "C";
    }
    else {
        temp = toFahrenheit(infodump.main.temp) ;
        feels = toFahrenheit(infodump.main.feels_like) 
        high = toFahrenheit(infodump.main.temp_max) 
        low = toFahrenheit(infodump.main.temp_min) 
        unit = "F";
    }
    $("#current").html(`
    <div class="row">
    <div class="col-12 text-center">tues march 17</div>
</div>
<div class="row">

    <div class="col-12">
        <h1 class="text-center">${cityName}</h1>
    </div>
</div>

<div class="row-12 text-center">
    <h2>${weatherDesc}</h2>
</div>
<div class="row-12 text-center">
    <h3>${temp}&deg${unit}</h3>
</div>
<div class="row">
    <div class="col-6">
        <p class="text-center">High: ${high}&deg${unit}</p>
        <p class="text-center">Low: ${low}&deg${unit}</p>
    </div>
    <div class="col 6">
        <p class="text-center">Humidity: ${humidity}</p>
        <p class="text-center">wind speed:${wind.speed}</p>
    </div>

</div>
<div class="row">
    <h2 class="col-12 text-center">uv index</h2>w
</div>
<div class="row" id="fiveForcast">

</div>

    `)

}
function toCelsius(k) {
    let celsius = Math.round(k - 273.15);
    return celsius;
}
function toFahrenheit(k) {
    let fahrenheit = Math.round((k - 273.15) * 1.8 + 32);
    return fahrenheit;
}