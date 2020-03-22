//value of searchbar
var searchbarValue;
//api key
var apiKey = "d7883c353f25f6ca1e88dfb9577483a0";
//metric Y/N
var metric = 0;
//array for selecting time from forcast data 
var forcastSelect = [5, 13, 21, 29, 37];
//built on page load. filled with local storage objects
var storedArray = [];
//currentweather
var infodump;
//uvi data
var uvData;
//forcast data
var forcast;
var cityInfo
//when page is loaded
onStart()
function onStart() {
    //builds StoredArray 
    buildarray()
    //if stored array is not empty, retrieve data from storedArray[0] and send to buildUrl() to build queryurl and send api call
    if (storedArray !== undefined) {
        if (storedArray[0] !== undefined) {
            buildUrl(storedArray[0].cityLat, null, storedArray[0].cityLong)
        }
        //if storedarra[1] has a value build history buttons
        if (storedArray[1] !== undefined) {
            buildButtons()
        }
    }
}
//button changes value of METRIC and builds current weather data again
$("#change-unit").on("click", function (event) {
    event.stopPropagation();
    if (metric === 0) {
        $(this).html(`C&deg`);
        metric = 1;
    }
    else {
        $(this).html(`F &deg`);
        metric = 0;
    }
    buildUrl(storedArray[0].cityLat, null, storedArray[0].cityLong)
})
//retrieves local storage and pushes it into STOREDARRAY. stops when array length is 6 or pulled data is undifined
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
//appends buttons from STOREDARRAY containing city,lat,and lon. starts at one because STOREDARRAY[0] is data to be displayed as current
function buildButtons() {
    let coordObject;
    $("#history").empty()
    for (let i = 1; i < storedArray.length; i++) {
        if (storedArray[i] !== undefined && storedArray[i] !== null) {
            let button = $(`<div class="col-12 btn btn-primary history-btn mb-1">`);
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
    //when history button is clicked, retrieve button object data and call BUILDURL() with lat,lon,and city
    $(".history-btn").on("click", function (event) {
        event.stopPropagation();
        let lat = $(this).data(coordObject.lat);
        let lon = $(this).data(coordObject.long);
        let city = $(this).data(coordObject.city);
        buildUrl(lat.lat, null, lon.long, lon.city);

    })
}
//when search button is clicked, call BUILDURL() with SEARCHBARVALUE
$("#search").on("click", function (event) {
    event.stopPropagation();
    searchbarValue = $("#searchbox").val();
    searchbarValue = searchbarValue.toString();
    buildUrl(searchbarValue, null, null);

})
//OH BOY! Here we go!!! 
//BUILDURL() will take up to 4 values. the values inported from each function call, whether NULL or not, will determine the function's path.
//VAL4 is to fix button city name issues with api
function buildUrl(val, val2, val3, val4) {
    let apiString;
    //if VAL1 exists and VAL2 does not, VAL1 is either a city name, zipcode, or History Button data.
    if (val2 === null || val2 === undefined) {
        //if VAL3 is NULL, VAL1 is a city or zipcode. 
        //1 THIS BUILDS THE URL FOR CURRENT WEATHER DATA
        if (val3 === null || val3 === undefined) {
            var searchBy;
            //by query if by city checkbox is checked
            if ($("#byName").is(':checked')) {
                searchBy = "q";
            }
            //by zip
            else {
                searchBy = "zip";
            }
            //url is sent to REQUESTDATA with the URL and a 0 to direct path 
            apiString = "https://api.openweathermap.org/data/2.5/weather?" + searchBy + "=" + val + ",&appid=" + apiKey;
            requestData(apiString, 0);
        }
        //If VAL3 is not NULL URL is current weather search using lat and lon of history button data
        else {
            //url is sent to REQUESTDATA with the URL and a 0 to direct path as well as VAL 4 to fix cityname data
            apiString = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&lat=" + val + "&lon=" + val3;
            requestData(apiString, 0, val4);
        }
    }
    //if VAL3 is NULL, URL is for UVI data
    else if (val3 === null) {
        //url is sent to REQUESTDATA with the URL and a 1 to direct path 
        apiString = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + val + "&lon=" + val2;
        requestData(apiString, 1)
    }
    //Else URL is for Forcast data
    else {
        //url is sent to REQUESTDATA with the URL and a 2 to direct path 
        apiString = "https://api.openweathermap.org/data/2.5/forecast?&lat=" + val + "&lon=" + val2 + "&appid=" + apiKey;
        requestData(apiString, 2)
    }
}
//function recieves APIURL and an X to determine path. (CITYVAL is added to fix problem with city name changes on button click)
function requestData(apiUrl, x, cityval) {
    $.ajax({
        url: apiUrl,
        method: "GET"
    })
        .then(function (response) {

            //if number sent with funtion call is 0, response is current weather 
            if (x === 0) {
                infodump = response;
                //if there is no city name in local storage CITYVAL = response city name
                if (cityval !== null && cityval !== undefined) {
                    infodump.name = cityval;
                }
                let lat = infodump.coord.lat;
                let long = infodump.coord.lon;
                //if stored data of city name does not match response name, SAVEHISTORY and BUILDBUTTIONS()
                if (storedArray[0] !== undefined) {
                    if (infodump.name !== storedArray[0].cityName) {
                        saveHistory(infodump.name, lat, long);
                        buildButtons();
                    }
                }
                else {
                    //if no stored data, SAVEHISTORY()
                    saveHistory(infodump.name, lat, long);
                }
                //Request URL of UVI data using lat and long
                buildUrl(lat, long, null);
            }
            //if x =1 response is UVI data. then request Url of FORCAST
            else if (x === 1) {
                uvData = response;
                let lat = uvData.lat;
                let long = uvData.lon;
                buildUrl(lat, long, 1);
            }
            //if x = 2 response is FORCAST data. then GETINFO to build page.
            else if (x === 2) {
                forcast = response;
                getinfo(infodump, uvData, forcast);
            }
        });
}
// CURRENT and UV are used to fill in a html template. BUILDFORCAST is called on after to append forcast to template
function getinfo(current, uv, forcast) {
    let cityName = current.name;
    let weatherDesc = current.weather[0].description;
    let temp;
    let feels;
    let high;
    let low;
    let unit;
    let humidity = Math.round(infodump.main.humidity) + "%"
    let wind = current.wind;
    //get date
    var today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    //builds and displays date
    today = mm + '/' + dd + '/' + yyyy;
    $("#datehere").text(today);
    //if metric is true,convert temp to metric
    if (metric) {
        temp = toCelsius(infodump.main.temp);
        feels = toCelsius(infodump.main.feels_like);
        high = toCelsius(infodump.main.temp_max);
        low = toCelsius(infodump.main.temp_min);
        unit = "C";
    }
    else {
        temp = toFahrenheit(infodump.main.temp);
        feels = toFahrenheit(infodump.main.feels_like);
        high = toFahrenheit(infodump.main.temp_max);
        low = toFahrenheit(infodump.main.temp_min);
        unit = "F";
    }
    let iconSrc = current.weather[0].icon;
    let uvVal = uv.value;
    var uvId;

    if (uvVal >= 0 && uvVal <= 2) {
        uvId = "uv1";
    }
    else if (uvVal > 2 && uvVal <= 5) {
        uvId = "uv2";
    }
    else if (uvVal > 5 && uvVal <= 7) {
        uvId = "uv3";
    }
    else if (uvVal > 7 && uvVal <= 10) {
        uvId = "uv4";
    }
    else {
        uvId = "uv5";
    }

    $("#current").html(`
    <div class="row ">
    <div class="col-12 text-center">${today}</div>
</div>
<div class="row">
<div class="col-12">
        <h1 class="text-center">${cityName}</h1>
    </div>
</div>

<div class="row-md-12 text-center">
    <h2>${weatherDesc}</h2>
    <img src="http://openweathermap.org/img/wn/${iconSrc}@2x.png">
</div>
<div class="row-12 text-center">
    <h2>${temp}&deg${unit}</h2>
</div>
<div class="row">
    <div class="col-md-6">
        <p class="text-center">High: ${high}&deg${unit}</p>
        <p class="text-center">Low: ${low}&deg${unit}</p>
    </div>
    <div class="col-md-6">
        <p class="text-center">Humidity: ${humidity}</p>
        <p class="text-center">wind speed: ${wind.speed} MPH</p>
    </div>

</div>
<div class="row">
    <h4 class="col-md-12 text-center "id="${uvId}">UV index: ${uvVal}</h4>
</div>
<div class="row " id="fiveForcast">
</div>
`)
    // after template is made BUILDFORCAST
    buildForcast(forcast)
}
//temp convertions
function toCelsius(k) {
    let celsius = Math.round(k - 273.15);
    return celsius;
}
function toFahrenheit(k) {
    let fahrenheit = Math.round((k - 273.15) * 1.8 + 32);
    return fahrenheit;
}
function buildForcast(forc) {
    //for each loop appends forcast template with forcast info from selected forcast number in FORCASTSELECT

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
        let forcastDay = $(`<div class="col-md-2 card bg-primary mx-auto">`);
        forcastDay.html(`
<div class="row">
    <div class="col-12 text-center">${date}</div>
</div>
<div class="row-12 text-center">
    <p>${weatherDesc}</p>
    <img src="https://openweathermap.org/img/wn/${iconSrc}@2x.png">
</div>
<div class="row-12 text-center">
    <h3>${temp}&deg${unit}</h3>
    <p class="text-center">Humidity: ${humidity}</p>
</div>
`)
        $("#fiveForcast").append(forcastDay)
    })
}
//appends CITYINFO to STOREDARRAY. removes last object if list becomes longer than 6
function saveHistory(name, lat, long) {
    cityInfo = {
        city: name,
        cityLat: lat,
        cityLong: long,
    }
    if (storedArray[0] === undefined || storedArray[0] === null) {
        storedArray.unshift(cityInfo);

    }
    else if (cityInfo.city !== storedArray[0].city) {
        if (storedArray[1] === null) {
            storedArray.unshift(cityInfo);
        }
        else {
            for (let h = 1; h < storedArray.length; h++) {
                console.log(h)
                if (storedArray[h] !== null) {
                    if (storedArray[h].city === cityInfo.city) {
                        storedArray.splice(h,1)
                        
                        h = storedArray.length
                    }
                }
            }
            storedArray.unshift(cityInfo);
        }

    }

    if (storedArray.length > 6) {
        storedArray.splice(-1, 1);
    }
    //for loop saves each object. overwriting every save
    for (let i = 0; i < storedArray.length; i++) {
        if (storedArray[i] !== null) {
            localStorage.setItem(i, JSON.stringify(storedArray[i]));
        }
    }

}
