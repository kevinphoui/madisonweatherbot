/* //////////////////////////////////////////////////////////////////////////////
 *
 * Weather Bot using Node.js
 * Kevin Phouisangiem
 * 
 ////////////////////////////////////////////////////////////////////////////// */

console.log("Weather bot is now online!");
var request = require('request');
var Twit = require('twit')
var configs = require('./configs');

var TwitterApi = new Twit(configs);

var currentTemp;
var minimumTemp;
var maximumTemp;
var weatherDescription;
var windSpeed;
var feels;
var alert;
var alertDescription;
var alertExists = false;
var restOfDay;

// Creates the current date
var date_ob = new Date();
var day = ("0" + date_ob.getDate()).slice(-2);
var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
var year = date_ob.getFullYear();
var dateTime = month + "/" + day;

var url = configs.apiLink + configs.lat + configs.long[0] + configs.long[1] +
    configs.exclude[0] + configs.exclude[1] + configs.appID[0] + configs.appID[1] +
    configs.units[0] + configs.units[1]

/**
 * Gets data from Open Weather Map API and calls CleanData() to clean it
 */
function GetData() {
    request({
        url: url, json: true
    },
        function (error, response, body) {
            if (!error && response.statusCode === 200) {

                currentTemp = body.current.temp;
                windSpeed = body.current.wind_speed;
                feels = body.current.feels_like;
                weatherDescription = body.current.weather[0].description;
                minimumTemp = body.daily[0].temp.min;
                maximumTemp = body.daily[0].temp.max;
                restOfDay = body.daily[0].weather[0].description;

                // checks if there is an alert, sets alert if does
                if (body.hasOwnProperty("alerts")) {
                    alert = body.alerts[0].event;
                    alertDescription = body.alerts[0].description.split('.');
                    alertDescription = alertDescription[3];
                    alertExists = true;
                }
                CleanData();

            } else {
                console.log("Error triggered inside of the GetData function.");
                console.log(error);
            }
        })
}

/**
 * cleans data, removes decimals and calls Tweet() function
 */
function CleanData() {
    currentTemp = currentTemp.toFixed(0);
    feels = feels.toFixed(0);
    minimumTemp = minimumTemp.toFixed(0);
    maximumTemp = maximumTemp.toFixed(0);
    windSpeed = windSpeed.toFixed(0);

    Tweet();
}

/**
 * Creates weather update message and tweets it
 */
function Tweet() {
    // TODO: If snowing/raining, add inches.

    // Creates the message to tweet
    var weatherUpdate =
        dateTime + " Weather Report!"; // 01/20 Weather Report!

    // adds weather warning if exists
    if (alertExists === true) {
        //weatherUpdate += "\n ⚠ " + alert.toUpperCase() + " ⚠" +
        "\n" + alertDescription;
    }

    // adds rest of message
    weatherUpdate +=
        "\n" + "Currently experiencing " + weatherDescription + " at " + currentTemp + "°F with " +
        windSpeed + "mph wind. " + "Feels like " + feels + "°F." +
        "\n" + "High of " + maximumTemp + "°F " +
        "and a low of " + minimumTemp + "°F with " + restOfDay + " for the rest of the day." +
        "\n"
    // only include #uwmadison if weather is bad
    if (alertExists === true) {
        weatherUpdate += "#UWMadison "
        alertExists = false;
    }
    weatherUpdate += "#madisonwi #madisonweather"
    // + special message
    // 280 char limit
    
    // uploads tweet
    var tweet = {
        status: weatherUpdate
    }
    TwitterApi.post('statuses/update', tweet, callback);
    function callback(error) {
        if (error) {
            console.log(error);
        } else {
            console.log("Tweeted successfully: \n" + weatherUpdate);
        }
    }
}

//TODO
/**
 * Adds occasional fun messages for specific days
 */
function specialMessage() {
    // start of school
        // "Enjoy your new semester!"
    // club day
        // check out XXX! Join new clubs!
    // really cold
        // chilly emoji
    // lot of inches of snow
        // have fun walking around
    // midterms
        // good luck on midterms!!
        // don't forget to take care of yourself!
    // graduations
        // congrats to the class of 2022!
    // end of semester/ last day of class
        // The last day of the semester! thank your TA's! 
    // finals
        // good luck on finals!!
        // dont forget to take care of yourself!
    // day before daylight savings
        // Daylight savings! We will advance an hour at 2AM
    // badgers play
        // badgers play today at XXXX

    // add picture/gif
    // will work on later
}

// tweets once a day
// if utc is 15:00:00 (9am cst): tweet
// wait 61 min to prevent constant tweeting
/*
var utcTime = new Date(new Date());
var utcHour = utcTime.toUTCString().substring(17, 22);
console.log("utcHour: " + utcHour);
// while not 8am (14), waits
while (utcHour != "01:10") { 
    setInterval(console.log(utcHour), 1000 * 60);
}
// waits an hour then tweet (will be 9 am by then)
//             1 sec * 60 * 61 = 1 hour and 1 minute
console.log("Tweeting soon");
*/
setInterval(GetData, 1000 * 60 * 60 * 24);


