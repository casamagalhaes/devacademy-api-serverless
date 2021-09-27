#!/usr/bin/env node
const { create } = require('../database');

create().catch(console.error).finally(process.exit);
