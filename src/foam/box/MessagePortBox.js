
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'MessagePortBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.RawMessagePortBox',
    'foam.box.RegisterSelfMessage',
    'foam.box.Message'
  ],

  imports: [ 'messagePortService', 'me' ],

  properties: [
    {
      name: 'target'
    },
    {
      name: 'delegate',
      factory: function() {
	      var channel = new MessageChannel();
	      this.messagePortService.addPort(channel.port1);

	this.target.postMessage(channel.port2, [ channel.port2 ]);

        channel.port1.postMessage(foam.json.Network.stringify(this.Message.create({
          object: this.RegisterSelfMessage.create({ name: this.me.name })
        })));

	      return this.RawMessagePortBox.create({ port: channel.port1 });
      }
    }
  ]
});
