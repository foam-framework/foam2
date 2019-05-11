/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SocketService',
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.nanos.box.NanoServiceRouter',
    'foam.nanos.logger.Logger',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'java.io.BufferedInputStream',
    'java.net.ServerSocket',
    'java.nio.ByteBuffer',
    'java.util.Random',
    'java.util.Base64',
    'java.net.Socket',
    'java.io.IOException',
    'java.io.ByteArrayOutputStream',
    'foam.box.Message'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'listen',
      value: true
    },
    {
      class: 'Boolean',
      name: 'listening'
    },
    {
      class: 'Int',
      name: 'port_',
      value: 7000
    },
    {
      class: 'Object',
      name: 'serverSocket',
      javaType:   'java.net.ServerSocket'
    },
    {
      class: 'Object',
      name: 'parser',
      javaType: 'foam.lib.json.JSONParser',
      javaFactory: `return getX().create(JSONParser.class);`
    },
    {
      class: 'Object',
      name: 'router',
      javaType: 'foam.nanos.box.NanoServiceRouter',
      javaFactory: `
        return getX().create(NanoServiceRouter.class);
      `
    }
  ],

  methods: [
    {
      name: 'setupServer',
      args: [
        {
          name: 'port',
          type: 'Integer'
        }
      ],
      javaCode:
        `try {
          ServerSocket serverSocket = new ServerSocket(port);
          setServerSocket(serverSocket); 
          setPort_(port);
          while (true) {
            new SocketClientHandler(getX(), getServerSocket().accept(), getParser(), getRouter()).start();
          }
        } catch (IOException e) {
          port = 10000 + (new Random().nextInt(10000) + 1);
          setupServer(port);
        }`
    },
    {
      name: 'stop',
      javaCode:
        `try {
          getServerSocket().close();
        } catch (IOException ex) {
          ((Logger) getX().get("logger")).error(ex);
        }`     
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
            `
            private static class SocketClientHandler extends Thread {
              private X x;
              private Socket clientSocket;
              private JSONParser parser;
              private NanoServiceRouter router;
          
              public SocketClientHandler(X x, Socket socket, JSONParser parser, NanoServiceRouter router) {
                this.x = x;
                this.parser = parser;
                this.clientSocket = socket;
                this.router = router;
              }

              public void run() {
                try {
                  read(this.clientSocket);
                } catch (java.lang.Exception ex) {
                  ((Logger) this.x.get("logger")).error(ex);
                } finally {
                  try {
                    clientSocket.close();
                  } catch (IOException e) {
                    ((Logger) this.x.get("logger")).error(e);
                  }
                }
              }

              public  void onData(byte[] data) {
                String mStr = new String(data);
                Message message = (Message) this.parser.parseString(mStr);
                this.router.send(message);
              }
  
              public  void read(Socket socket) throws IOException{
                BufferedInputStream bis ;
                try {
                  int start = 0;
                  int read = 0;
                  bis = new BufferedInputStream(socket.getInputStream());
                  while (true) {
                    int nextSize = 0;
                    byte[] lenbuffer = new byte[4];
                    bis.mark(lenbuffer.length);
                    read = bis.read(lenbuffer, 0, lenbuffer.length);
                    if ( read == -1 ) break;
                    nextSize = ByteBuffer.wrap(lenbuffer).getInt();
                    bis.reset();
                    
                    bis.read(lenbuffer, 0, lenbuffer.length);
                    start += lenbuffer.length;

                    byte[] data = new byte[nextSize];
                    bis.read(data, 0, nextSize);
                    start += data.length;
              
                    onData(data);
              
                  }
                } catch (IOException e) {
                  ((Logger) this.x.get("logger")).error(e);
                  throw new IOException(e);
                } finally {
                  try {
                    socket.getOutputStream().close();
                    socket.close();
                  } catch (IOException e) {
                    ((Logger) this.x.get("logger")).error(e);
                  }
                }
              }
            }
            `
        }));
      }
    }
  ],
});
