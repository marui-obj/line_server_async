const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const envConfig = require('./configs/env.config');
const databaseConfig = require('./configs/database.config')

const lineRoutes = require('./routes/line.routes')

mongoose.connect(`${databaseConfig.uri}${databaseConfig.db}`)
.then(() => console.log(`MongoDB Connected at ${databaseConfig.uri}, db_name ${databaseConfig.db}`))
.catch(err => console.log(err)
);

app.get('/', (req, res) => res.send("Hello from linebot")); //index routes
app.use('/line', lineRoutes);

const port = (process.env.PORT || envConfig.port);

app.listen(port, () => console.log(`Start server at port ${port}`));

