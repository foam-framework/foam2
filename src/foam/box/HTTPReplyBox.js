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
  name: 'HTTPReplyBox',
  implements: ['foam.box.Box'],

  imports: [
    // Optional import.
    //    'httpResponse'
  ],

  methods: [
    {
      name: 'send',
      code: function(m) {
        throw 'unimplemented';
      },
      swiftCode: 'throw FoamError("unimplemented")',
      javaCode: `
try {
  javax.servlet.http.HttpServletResponse response = (javax.servlet.http.HttpServletResponse)getX().get("httpResponse");
  response.setContentType("application/json");
  java.io.PrintWriter writer = response.getWriter();
  writer.print(new foam.lib.json.Outputter(getX()).setPropertyPredicate(new foam.lib.NetworkPropertyPredicate()).stringify(msg));
  writer.flush();
} catch(java.io.IOException e) {
  throw new RuntimeException(e);
}
`
    }
  ]
});
