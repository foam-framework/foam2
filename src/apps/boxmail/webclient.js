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

var env = foam.box.Context.create();

foam.box.NamedBox.create({
  name: '/ca/vany/adam'
}, env).delegate = foam.box.WebSocketBox.create({ uri: 'ws://localhost:4000 '}, env);

var dao = foam.dao.ClientDAO.create({
  delegate: foam.box.NamedBox.create({
    name: '/ca/vany/adam/INBOX'
  }, env)
}, env);

var canvas = foam.graphics.Canvas.create({
  width: 600,
  height: 600
});

canvas.cview = foam.graphics.ScrollCView.create({
  size: 1000,
  rotation: -0.4,
  skewY: 0.2,
  x: 50,
  y: 20,
  extent: 10
}, canvas);

canvas.write();

var view = foam.u2.TableView.create({
  of: 'boxmail.Message',
  properties: [
    'subject',
    'body'
  ]
});
view.write();

function updateTable() {
  view.data = dao.limit(canvas.cview.extent).skip(canvas.cview.value);
}
canvas.cview.value$.sub(updateTable);
updateTable();

// dao.select().then(function(m) {
//   var out = "";
//   out += '<div>Read ' + m.a.length + ' mails.';
//   out += '<table><thead><td>Subject</td><td>Body</td></thead><tbody>';

//   for ( var i = 0 ; i < m.a.length ; i++ ) {
//     var mail = m.a[i];
//     out += '<tr><td>' + mail.subject + '</td><td>' + mail.body + '</td></tr>';
//   }
//   out += '</tbody></table>';

//   document.body.insertAdjacentHTML('beforeend', out);
// });
