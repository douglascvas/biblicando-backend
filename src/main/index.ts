import {Server} from "./server";

var server = Server.build();

server.initialize()
  .then(()=>server.start())
  .catch(e => {
    server.logger.error(e.stack);
  });