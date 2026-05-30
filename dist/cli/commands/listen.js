import { Command } from 'commander';
import http from 'node:http';
export const listenCommand = new Command('listen')
    .description('Listen for webhooks locally')
    .option('-p, --port <number>', 'Port to listen on', '3000')
    .option('--forward-to <url>', 'Forward webhooks to local server')
    .action((options) => {
    const port = parseInt(options.port, 10);
    const forwardTo = options.forwardTo;
    console.log(`PayNexus webhook listener starting on port ${port}...`);
    const server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('Webhook received:');
            console.log('Method:', req.method);
            console.log('URL:', req.url);
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            console.log('Body:', body);
            if (forwardTo) {
                console.log(`Forwarding to ${forwardTo}...`);
                // Implement forwarding logic here
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ received: true }));
        });
    });
    server.listen(port, () => {
        console.log(`Webhook listener running on http://localhost:${port}`);
        console.log('Press Ctrl+C to stop');
    });
    server.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
});
//# sourceMappingURL=listen.js.map