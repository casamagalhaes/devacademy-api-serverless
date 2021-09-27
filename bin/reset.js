#!/usr/bin/env node
const { reset } = require('../database');

reset().catch(console.error).finally(process.exit);
