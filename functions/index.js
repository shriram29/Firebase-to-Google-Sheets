//  All OC code
const functions = require("firebase-functions");
const express = require("express");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
const { google } = require("googleapis");

// inits
const app = express();

// View Engine Set
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.use(cookieParser());

app.get('/', (req,res)=>{
  var jwt = getJwt();
  var apiKey = getApiKey();
  var spreadsheetId = "1D89UQvs-5zxxXtDe2b7pAerBtixNz9Z9KxDXC6SjqFI";
  var range = "A1";
  var row = [new Date(), "A Cloud Function was here"];
  appendSheetRow(jwt, apiKey, spreadsheetId, range, row);
  res.status(200).type("text/plain").end("OK");
});

function getJwt() {
  var credentials = require("./credentials.json");
  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

function getApiKey() {
  var apiKeyFile = require("./api_key.json");
  return apiKeyFile.key;
}

function appendSheetRow(jwt, apiKey, spreadsheetId, range, row) {
  const sheets = google.sheets({ version: "v4" });
  sheets.spreadsheets.values.append(
    {
      spreadsheetId: spreadsheetId,
      range: range,
      auth: jwt,
      key: apiKey,
      valueInputOption: "RAW",
      resource: { values: [row] },
    },
    function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log("Updated sheet: " + result.data.updates.updatedRange);
      }
    }
  );
}



exports.app = functions.https.onRequest(app);