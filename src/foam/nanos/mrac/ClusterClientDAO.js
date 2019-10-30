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
  package: 'foam.nanos.mrac',
  name: 'ClusterClientDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
  ],

  properties: [
    {
      name: 'dao',
    },
    {
      type: 'String',
      name: 'url'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaFactory: `
    Box box = new HTTPBox.Builder(x)
      .setMethod('POST')
      .setUrl(getUrl())
      .build();
    box = new SessionClientBox.Builder(x)
      .setClientBox(box)
      .build();
    DAO dao = new ClientDAO.Builder(x)
      .setDelegate(box)
      .build();
    setDao(dao);

    /*
          delegate: this.SessionClientBox.create({
            delegate: this.RetryBox.create({
              maxAttempts: -1,
              delegate: this.HTTPBox.create({
                method: 'POST',
                url: 'service/nSpecDAO'
              })
            })
          })
    */
      `
    }
  ]
});
