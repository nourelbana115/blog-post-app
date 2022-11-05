const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoURI, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    });
    console.log('Mongo DB connected ...');
  } catch (error) {
    process.exit(1);
  }
};
module.exports = connectDB;
