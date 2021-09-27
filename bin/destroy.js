#!/usr/bin/env node
const { destroy } = require('../database');

destroy().catch(console.error).finally(process.exit);
