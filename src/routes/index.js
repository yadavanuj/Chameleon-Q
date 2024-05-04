const messageBoxRegistry = require("./messagebox.routes");

const register = (app) => {
    messageBoxRegistry.register(app);
};

module.exports = { register };