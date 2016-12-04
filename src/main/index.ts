import {ServerFactory} from "./common/serverFactory";

async function start() {
  const server = new ServerFactory().createServer();
  try {
    await server.initialize();
    await server.start();
  } catch (e) {
    server.logger.error(e.stack);
  }
}

start();
