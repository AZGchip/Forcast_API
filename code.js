var searchbarValue;
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";
var infodump;
var metric = 0;
var uvData;
var forcast;
var forcastSelect = [5, 13, 21, 29, 37];
var storedArray = [];
var coordObject;
var test
onStart()

function onStart() {
    buildarray()
    if (storedArray !== undefined) {
        if (storedArray[0] !== undefined) {
            buildUrl(storedArray[0].cityLat, null, storedArray[0].cityLong)

        }
        if (storedArray[1] !== undefined) {
            buildButtons()
        }
    }
}
function buildarray() {

    if (localStorage.getItem(0) !== null) {
        for (let n = 0; n < 6; n++) {
            var storedData = JSON.parse(localStorage.getItem(n));
            if (storedData !== undefined) {
                storedArray.push(storedData);
            }
            else {
                return 0
            }


        }
    }
}
function buildButtons() {
    $("#history").empty()
    for (let i = 1; i < storedArray.length; i++) {
        if (storedArray[i] !== undefined || storedArray[i] !== null) {
            let button = $(`<div class="col-12 btn btn-primary history-btn">`);
            let aLat = storedArray[i].cityLat;
            let aLong = storedArray[i].cityLong;
            let city = storedArray[i].city;
            coordObject = {
                lat: aLat,
                long: aLong,
                city: city
            }
            button.data(coordObject);
            button.text(`${storedArray[i].city}`);
            $("#history").append(button);
        }
    }
    $(".history-btn").on("click", function (event) {
        event.stopPropagation();
        let lat = $(this).data(coordObject.lat);
        let lon = $(this).data(coordObject.long);
        let city = $(this).data(coordObject.city);
        buildUrl(lat.lat, null, lon.long,lon.city);
        console.log(lon.city)
    })
}
$("#search").on("click", function (event) {
    event.stopPropagation();
    searchbarValue = $("#searchbox").val();
    searchbarValue = searchbarValue.toString();
    buildUrl(searchbarValue, null, null);

})
function buildUrl(val, val2, val3,val4) {
    let apiString;
    //if second value is null 
    if (val2 === null || val2 === undefined) {
        if (val3 === null || val3 === undefined) {

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
            apiString = "http://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&lat=" + val + "&lon=" + val3
            requestData(apiString, 0,val4);
        }
        

    }
    else if (val3 === null) {
        apiString = "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + val + "&lon=" + val2
        requestData(apiString, 1)


    }
    else {
        apiString = "http://api.openweathermap.org/data/2.5/forecast?&lat=" + val + "&lon=" + val2 + "&appid=" + apiKey
        requestData(apiString, 2)
    }
}
function requestData(apiUrl, x,cityval) {


    $.ajax({
        url: apiUrl,
        method: "GET"
    })
        .then(function (response) {


            if (x === 0) {
                console.log(cityval)
                infodump = response;
                if(cityval !== null&& cityval !== undefined){
                    infodump.name = cityval;
                }
                let lat = infodump.coord.lat;
                let long = infodump.coord.lon;
                if (storedArray[0] !== undefined) {
                    if (infodump.name !== storedArray[0].cityName) {
                        saveHistory(infodump.name, lat, long);
                        buildButtons();
                    }
                }
                else{
                    saveHistory(infodump.name, lat, long);
                }

                buildUrl(lat, long, null);

            }
            else if (x === 1) {
                uvData = response;
                let lat = uvData.lat;
                let long = uvData.lon;
                buildUrl(lat, long, 1)

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
    let iconSrc = current.weather[0].icon
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
    <img src="http://openweathermap.org/img/wn/${iconSrc}@2x.png">
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


        let iconSrc = forc.list[i].weather[0].icon
        let date = forc.list[i].dt_txt;
        date = date.slice(5, 10);
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
    <img src="http://openweathermap.org/img/wn/${iconSrc}@2x.png">
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
function saveHistory(name, lat, long) {
    let cityInfo = {
        city: name,
        cityLat: lat,
        cityLong: long,
    }
    if (cityInfo.cityLat !== storedArray[0].cityLat){
        storedArray.unshift(cityInfo);
    }
    
    if (storedArray.length > 6) {
        storedArray.splice(-1, 1);
    }
    for (let i = 0; i < storedArray.length; i++) {
        if (storedArray[i] !== null) {
            localStorage.setItem(i, JSON.stringify(storedArray[i]));
        }
    }

}
