const schedule = require("node-schedule");
const axios = require("axios");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const writeApi = new InfluxDB({
  url: process.env.URL,
  token: process.env.TOKEN,
}).getWriteApi(process.env.ORG, process.env.BUCKET, "ns");

writeApi.useDefaultTags({ location: "host2" });

const getApiData = schedule.scheduleJob("*/5 * * * *", function () {
  axios
    .get(process.env.API_URL)
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

module.exports = getApiData;
