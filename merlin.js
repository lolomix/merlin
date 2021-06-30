const { spawn } = require("child_process");

const newMerlin = () => {
  let ls = spawn("node", ["main", "--predictable-gc-schedule"]);

  ls.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  ls.stderr.on("data", (data) => {
    console.log(`${data}`);
  });

  ls.on("error", (error) => {
    console.log(`${error.message}`);
  });

  ls.on("close", () => {
    newMerlin();
  });
};

newMerlin();
