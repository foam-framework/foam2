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
      value: 'service'
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
        HTTPBox box = new HTTPBox.Builder(getX())
          .setUrl(uri.toURL().toString())
          .build();
        setDelegate(box);
       } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
         ((Logger) getX().get("logger")).error(e);
       }
      `
    },
    {
      name: 'put_',
      code: function(x, obj) {
        return request_(x, "put", obj);
      },
      javaCode: `
        return request_(x, "put", obj);
      `
    },
    {
      name: 'remove_',
      code: function(x, obj) {
        return request_(x, "remove", obj);
      },
      javaCode: `
        return request_(x, "remove", obj);
      `
    },
    /* TODO: select, find, ... */
    {
      name: 'request_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'cmd',
          type: 'String'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      code: function(x, cmd, obj) {
        var request = ClusterRequest.create({
          cmd: cmd,
          obj: obj
        });
        return getDelegate().cmd_(x, request);
      },
      javaCode: `
        ClusterRequest request = new ClusterRequest.Builder(getX())
          .setCmd(cmd)
          .setObj(obj)
          .build();
        return (foam.core.FObject) getDelegate().cmd_(x, request);
      `
    }
  ]
});
