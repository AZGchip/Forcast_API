var searchbarValue;
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";
var infodump;
var metric = 0;
var uvData;
var forcast;
var forcastSelect = [0, 13, 21, 29, 37]

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
            else if (x === 2) {
                forcast = response
                getinfo(infodump, uvData, forcast)

            }


        });
}
function getinfo(current, uv, forcast) {

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
        temp = toFahrenheit(infodump.main.temp);
        feels = toFahrenheit(infodump.main.feels_like)
        high = toFahrenheit(infodump.main.temp_max)
        low = toFahrenheit(infodump.main.temp_min)
        unit = "F";
    }
    let uvVal = uv.value;
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
    <h2 class="col-12 text-center">uv index:${uvVal}</h2>
</div>
<div class="row" id="fiveForcast">


<div class="col-sm-1"></div>
</div>

    `)
    buildForcast(forcast)
}
function toCelsius(k) {
    let celsius = Math.round(k - 273.15);
    return celsius;
}
function toFahrenheit(k) {
    let fahrenheit = Math.round((k - 273.15) * 1.8 + 32);
    return fahrenheit;
}
function buildForcast(forc) {
    forcastSelect.forEach(i => {



        let date = forc.list[i].dt_txt;
        let weather = forc.list[i].weather[0].main
        let weatherDesc = forc.list[i].weather[0].description
        let temp;
        let unit;
        let humidity = Math.round(forc.list[i].main.humidity) + "%"

        if (metric) {
            temp = toCelsius(forc.list[i].main.temp)

            unit = "C";
        }
        else {
            temp = toFahrenheit(forc.list[i].main.temp);
            unit = "F";
        }
        let forcastDay = $(`<div class="col-2">`);
        forcastDay.html(`
    <div class="row">
    <div class="col-12 text-center">${date}</div>
</div>


<div class="row-12 text-center">
    <p>${weatherDesc}</p>
</div>
<div class="row-12 text-center">
    <h3>${temp}&deg${unit}</h3>
    <p class="text-center">Humidity: ${humidity}</p>
</div>
<div class="row">
    
    
      
       

</div>



</div>
    `)
        $("#fiveForcast").append(forcastDay)



    })
    
}