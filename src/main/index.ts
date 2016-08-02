import {ServerFactory} from "./common/serverFactory";

var server = new ServerFactory().createServer();

server.initialize()
  .then(()=>server.start())
  .catch(e => {
    server.logger.error(e.stack);
  });