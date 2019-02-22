'use strict';
const fs = require('fs');
const path = require('path');
const walk = require('./lib/walk')(fs,path);

module.exports = walk;
