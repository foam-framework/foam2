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

var env = foam.box.Context.create();
env.me = foam.box.NamedBox.create({ name: '/ca/vany/adam' }, env);

// Force services to start.
env.socketService;
env.webSocketService;

var dao = foam.dao.MDAO.create({
  of: boxmail.Message
});

env.registry.register(
  'INBOX',
  null,
  foam.box.SkeletonBox.create({
    data: dao.orderBy(boxmail.Message.ID)
  }));

var text = ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.').split(' ');

function word() {
  return text[Math.floor(Math.random() * text.length)];
}

function words() {
  return word() + ' ' + word() + ' ' + word() + ' ' + word();
}

for ( var i = 0 ; i < 10000 ; i++ ) {
  dao.put(boxmail.Message.create({
    id: i,
    subject: "[" + i + "] " + word(),
    body: words()
  }));
}
