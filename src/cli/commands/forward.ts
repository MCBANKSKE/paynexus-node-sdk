import { Command } from 'commander';

export const forwardCommand = new Command('forward')
  .description('Forward webhooks to a local server')
  .argument('<url>', 'Local server URL to forward webhooks to')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .action((url, options) => {
    const port = parseInt(options.port, 10);
    console.log(`PayNexus webhook forwarder`);
    console.log(`Listening on port ${port}`);
    console.log(`Forwarding to ${url}`);
    console.log('Press Ctrl+C to stop');
  });
