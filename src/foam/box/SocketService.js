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
    'foam.nanos.logger.Logger',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'java.net.ServerSocket',
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
            new SocketClientHandler(getX(), getServerSocket().accept(), getParser()).start();
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
            protected static int bufferSize = 1024;
            private static class SocketClientHandler extends Thread {
              private X x;
              private Socket clientSocket;
              private JSONParser parser;
          
              public SocketClientHandler(X x, Socket socket, JSONParser parser) {
                this.x = x;
                this.parser = parser;
                this.clientSocket = socket;
              }

              public void run() {
                try {
                  String mStr = Base64.getEncoder().encodeToString(read(this.clientSocket));
                  Message message = (Message) this.parser.parseString(mStr);
                  SocketServiceBox box = new SocketServiceBox(this.clientSocket);
                  box.send(message);                  
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
            }
            public static byte[] read(Socket socket) throws IOException{
              byte[] buffer = new byte[bufferSize];
              ByteArrayOutputStream data = new ByteArrayOutputStream();
              int read;
              try {
                while ((read = socket.getInputStream().read(buffer, 0, buffer.length)) != -1) {
                  data.write(buffer, 0, read);
                }
                data.flush();
          
              } catch (IOException e) {
                //((Logger) getX().get("logger")).error(e);
                throw new IOException(e);
              } finally {
                try {
                  socket.getOutputStream().close();
                  socket.close();
                } catch (IOException e) {
                  //((Logger) getX().get("logger")).error(e);
                }
              }
              return data.toByteArray();
            }
            `
        }));
      }
    }
  ],
});
