/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

require('./bootFOAMNode.js');

if ( process.argv.length < 4 ) {
  console.log('USAGE: node sendmail.js "Subject" "Body"');
  process.exit();
}

var env = foam.box.Context.create()

var dst = foam.box.SocketBox.create({
  address: '0.0.0.0:7000',
}, env);

var msg = boxmail.Message.create({
  subject: process.argv[2],
  body: process.argv[3]
});

var dao = foam.dao.ClientDAO.create({
  delegate: foam.box.SubBox.create({
    name: 'INBOX',
    delegate: dst
  }, env)
}, env);

dao.put(msg).then(function() {
  console.log("Mail sent.");
  process.exit(0);
});
