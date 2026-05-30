#!/usr/bin/env node

import { Command } from 'commander';
import { listenCommand } from './commands/listen.js';
import { forwardCommand } from './commands/forward.js';

const program = new Command();

program
  .name('paynexus')
  .description('PayNexus CLI - Webhook forwarding and local development tools')
  .version('1.0.0');

program.addCommand(listenCommand);
program.addCommand(forwardCommand);

program.parse();
