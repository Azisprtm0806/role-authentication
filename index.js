const cors = require("cors");
const exp = require("express");
const bp = require("body-parser");
const { connect } = require("mongoose");
const { success, error } = require("consola");
const passport = require("passport");

// Bring in the app constants
const { DB, PORT } = require("./config");

// Initialize the application
const app = exp();

// Middleware
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

require("./middleware/passport")(passport);

// user Router Middleware
app.use("/api/users", require("./routes/user"));

const startApp = async () => {
  try {
    // Connection with DB
    await connect(DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    success({
      message: `SuccesFully connected with the Database \n${DB}`,
      badge: true,
    });

    // start Listening for the server on PORT
    app.listen(PORT, () =>
      success({ message: `Server started on PORT ${PORT}`, badge: true })
    );
  } catch (error) {
    error({ message: `Unable to connect with Database ${err}`, badge: true });
    startApp();
  }
};

startApp();
