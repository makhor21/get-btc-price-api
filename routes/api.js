const express = require("express");
const router = express.Router();
const { InfluxDB, Point, HttpError } = require("@influxdata/influxdb-client");
const { hostname } = require("os");

const queryApi = new InfluxDB({
  url: process.env.URL,
  token: process.env.TOKEN,
}).getQueryApi(process.env.ORG);

router.get("/", (req, res, next) => {
  const query = `from(bucket: "majid") |> range(start: -3h) |> filter(fn: (r) => r._measurement == "btc") |> sort(columns:["_time"], desc: true)`;
  queryApi
    .collectRows(query)
    .then((data) => {
      console.log("\nCollect ROWS SUCCESS");
      return res.render("index", { data });
    })
    .catch((error) => {
      console.error(error);
      console.log("\nCollect ROWS ERROR");
    });
});

module.exports = router;
