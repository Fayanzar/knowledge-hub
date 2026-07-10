module.exports = {
  apps : [{
    name: "hub-server",
    script: "./src/server.ts",
    interpreter: "node",
    interpreter_args: "--import tsx",
  }],
};
