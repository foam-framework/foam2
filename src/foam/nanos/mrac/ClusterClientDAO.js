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
  extends: 'foam.dao.ClientDAO',

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.ProxyBox',
    //    'foam.box.RetryBox',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'path',
      class: 'String',
      value: 'server' // TODO: change to 'cluster'
    },
    {
      documentation: `nSpec service name at the remote node.`,
      name: 'serviceName',
      class: 'String'
    },
    {
      documentation: `Configuration of the remote node.`,
      name: 'config',
      class: 'FObjectProperty',
      type: 'foam.nanos.mrac.ClusterConfig'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
        try {
        ClusterConfig config = getConfig();
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), "/"+getPath()+"/"+getServiceName(), null, null);
        Box box = new HTTPBox.Builder(getX())
          .setUrl(uri.toURL().toString())
          .build();
        // ProxyBox proxy = new RetryBox.Builder(getX())
        //   .setDelegate(box)
        //   .build();
        // setDelegate(proxy);
        setDelegate(box);
       } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
         ((Logger) getX().get("logger")).error(e);
       }
      `
    }
  ]
});
