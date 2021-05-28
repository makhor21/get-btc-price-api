const { InfluxDB, Point, HttpError } = require("@influxdata/influxdb-client");
const { hostname } = require("os");

const queryApi = new InfluxDB({
  url: "https://europe-west1-1.gcp.cloud2.influxdata.com",
  token:
    "o0GmPlKk8J3CHMq553vcIwL1dqY4vIAoBG3eF8_NrzArzXJga5cNQktkuDHyqHiUZYcM0kG-JqDCaKyTwYuK2A==",
}).getQueryApi("mkhorshidian72@gmail.com");

const getDatabaseData = function () {
  const query = `from(bucket: "majid") |> range(start: -3h) |> filter(fn: (r) => r._measurement == "btc") |> sort(columns:["_time"], desc: true)`;
  queryApi
    .collectRows(query)
    .then((data) => {
      console.log("\nCollect ROWS SUCCESS");
      return data;
    })
    .catch((error) => {
      console.error(error);
      console.log("\nCollect ROWS ERROR");
    });
};

module.exports = getDatabaseData;
