const path = require('path');
const express = require('express');
const logger  = require('morgan');

const app = express();

const args= require('minimist')(process.argv.slice(2), {string: "port"})
app.set('port', args.port || process.env.PORT || 5000);
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('tiny'));

const routes = require('./routes')

app.use(express.urlencoded({extended: false}));
app.use(require('./routes'));
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route handler for docs not found
app.use((req, res, next) => {
  res.status(404).render('404');
});

module.exports = app;