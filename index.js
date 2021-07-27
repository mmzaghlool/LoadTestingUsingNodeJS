"use strict";
const childProc = require("child_process");
const CHILD_PROCESSES = 20;
const URL = "https://google.com";

(async () => {
  let times = [];
  let errors = [];
  let children = [];

  for (let i = 0; i < CHILD_PROCESSES; i++) {
    let childProcess = childProc.spawn("node", ["child.js", `--url=${URL}`]);
    children.push(childProcess);
  }

  let responses = children.map(function wait(child) {
    return new Promise(function c(resolve) {
      child.stdout.on("data", (data) => {
        if (typeof parseInt(data) === "number") {
          console.log(`child stdout: ${data}`);

          times.push(parseInt(data));
        } else {
          console.log(`child error: ${data}`);
          errors.push(data + "");
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

  responses = await Promise.all(responses);

  console.log(`==========================================================`);

  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length || 0;
  console.log(`average: ${avg}`);

  const success = responses.filter((v) => v === true);
  const successRate = success.length / responses.length;
  console.log(`success rate: ${successRate}`);

  // console.log(`==========================================================`);
  // console.log("errors: ", errors.length, errors);
})();
