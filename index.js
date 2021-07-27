"use strict";
const childProc = require("child_process");
const CHILD_PROCESSES_PER_SECOND = 25;
const DURATION_IN_SECONDS = 1 * 60;
const URL = "https://google.com";

const times = [];
let responses = [];

(async () => {
  let counter = 1;

  const timeInterval = setInterval(async () => {
    console.log(`==========================================================`, counter);

    executeOneSecond();

    if (counter === DURATION_IN_SECONDS) {
      clearInterval(timeInterval);
      calculateTotals(times, responses);
    }
    counter++;
  }, 1000);
})();

const calculateTotals = async () => {
  responses = await Promise.all(responses);
  console.log(`==========================================================`);

  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length || 0;
  console.log(`average: ${avg}`);

  const success = responses.filter((v) => v === true);
  const successRate = success.length / responses.length;
  console.log(`success rate: ${successRate}`);
};

const executeOneSecond = () => {
  return new Promise(async (res) => {
    const children = [];

    for (let i = 0; i < CHILD_PROCESSES_PER_SECOND; i++) {
      const childProcess = childProc.spawn("node", ["child.js", `--url=${URL}`]);
      children.push(childProcess);
    }

    const r = children.map(function wait(child) {
      return new Promise(function c(resolve) {
        child.stdout.on("data", (data) => {
          if (typeof parseInt(data) === "number") {
            console.log(`child stdout: ${data}`);

            times.push(parseInt(data));
          } else {
            console.log(`child error: ${data}`);
          }
        });

        child.on("exit", function (code) {
          if (code === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
    responses = responses.concat(r);

    res();
  });
};
