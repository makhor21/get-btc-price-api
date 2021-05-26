const express = require("express");
const app = express();
const logger = require("morgan");
const schedule = require("node-schedule");
const axios = require("axios");
const { InfluxDB, Point, HttpError } = require("@influxdata/influxdb-client");
const { hostname } = require("os");

app.use(logger("dev"));
app.set("view engine", "ejs");

const writeApi = new InfluxDB({
  url: "https://europe-west1-1.gcp.cloud2.influxdata.com",
  token:
    "o0GmPlKk8J3CHMq553vcIwL1dqY4vIAoBG3eF8_NrzArzXJga5cNQktkuDHyqHiUZYcM0kG-JqDCaKyTwYuK2A==",
}).getWriteApi("mkhorshidian72@gmail.com", "majid", "ns");

writeApi.useDefaultTags({ location: hostname() });

const queryApi = new InfluxDB({
  url: "https://europe-west1-1.gcp.cloud2.influxdata.com",
  token:
    "o0GmPlKk8J3CHMq553vcIwL1dqY4vIAoBG3eF8_NrzArzXJga5cNQktkuDHyqHiUZYcM0kG-JqDCaKyTwYuK2A==",
}).getQueryApi("mkhorshidian72@gmail.com");

schedule.scheduleJob("*/5 * * * *", function () {
  axios
    .get("https://api.coincap.io/v2/assets/bitcoin")
    .then((res) => {
      const point = new Point("btc")
        .floatField("price", res.data.data.priceUsd)
        .timestamp(new Date());
      writeApi.writePoint(point);
      console.log(` ${point.toLineProtocol(writeApi)}`);
    })
    .catch((err) => {
      console.log("Error: ", err.message);
    });
});

app.get("/", (req, res, next) => {
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

const port = 8080;

app.listen(port, () => {
  console.log(`Server running on localhost:${port} ...`);
});
