import IRBlasterScanner from './blaster-scanner.js';

const scanner = new IRBlasterScanner('192.168.88.223:9001');

setTimeout(() => {
	const clients = scanner.get();
	console.log(clients);

	if (clients.length) {
		clients[0].subscribe(console.log);
	}
}, 10000)


