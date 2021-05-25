const express = require("express");
const app = express();
const logger = require("morgan");
const schedule = require("node-schedule");
const axios = require("axios");
const { InfluxDB, Point, HttpError } = require("@influxdata/influxdb-client");
const { hostname } = require("os");

app.use(logger("dev"));

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
    .then((response) => {
      const point = new Point("btc")
        .floatField("price", response.data.data.priceUsd)
        .timestamp(new Date());
      writeApi.writePoint(point);
      console.log(` ${point.toLineProtocol(writeApi)}`);
    })
    .catch((error) => {
      console.log(error);
    });
});

let result = [];

app.get("/api", (req, res, next) => {
  const query = `from(bucket: "majid") |> range(start: -3h) |> filter(fn: (r) => r._measurement == "btc")`;
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      let object = {
        time: o._time,
        field: o._measurement,
        price: o._value,
      };
      result.push(object);
    },
    error(error) {
      console.error(error);
      console.log("Finished ERROR");
    },
    complete() {
      console.log("Finished SUCCESS");
    },
  });
  return res.json(result);
});

const port = 8080;

app.listen(port, () => {
  console.log(`Server running on localhost:${port} ...`);
});
