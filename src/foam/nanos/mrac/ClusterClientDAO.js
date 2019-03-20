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
    'foam.core.FObject',
    'foam.lib.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.nanos.logger.Logger',
    'java.io.BufferedWriter',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.nio.charset.StandardCharsets',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'javax.servlet.http.HttpServletResponse',
    'org.apache.commons.io.IOUtils'
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
    },
    {
      name: 'url',
      class: 'String',
      transient: true,
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
        try {
        ClusterConfig config = getConfig();
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), "/"+getPath()+"/"+getServiceName(), null, null);
        setUrl(uri.toURL().toString());
       } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
         ((Logger) getX().get("logger")).error(e);
       }
      `
    },
    {
      name: 'put_',
      code: function(x, obj) {
        return send_(x, "put", obj);
      },
      javaCode: `
        return send_(x, "put", obj);
      `
    },
    {
      name: 'remove_',
      code: function(x, obj) {
        return send_(x, "remove", obj);
      },
      javaCode: `
        return send_(x, "remove", obj);
      `
    },
    /* TODO: select, find, ... */
    {
      name: 'send_',
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
   // Simple client
   // - sends one message at a time
   // - does not handle failture/retry

   ClusterRequest request = new ClusterRequest.Builder(getX())
      .setCmd(cmd)
      .setObj(obj)
      .build();

    HttpURLConnection conn = null;
    OutputStream os = null;
    BufferedWriter writer = null;

    try {
      String url = getUrl() + "?cmd=cmd";

      Outputter outputter = null;
      conn = (HttpURLConnection) new URL(url_).openConnection();
      conn.setRequestMethod("POST");
      conn.setDoInput(true);
      conn.setDoOutput(true);
        outputter = new foam.lib.json.Outputter(OutputterMode.NETWORK);
        conn.addRequestProperty("Accept", "application/json");
        conn.addRequestProperty("Content-Type", "application/json");
      conn.connect();

      os = conn.getOutputStream();
      writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
      writer.write(outputter.stringify((FObject)request));
      writer.flush();
      writer.close();
      os.close();

      // check response code
      int code = conn.getResponseCode();
      if ( code != HttpServletResponse.SC_OK ) {
       ((Logger) getX().get("logger")).error(this.getClass().getSimpleName(), "send", "response", code, "request", request);
        throw new RuntimeException("Http server did not return 200.");
      }
      return new ClusterResponse.Builder(getX()).setCmd(cmd).setMessage(Integer.toString(code)).build();
    } catch (Throwable t) {
       ((Logger) getX().get("logger")).error(this.getClass().getSimpleName(), "send", "request", request, t);
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(writer);
      IOUtils.closeQuietly(os);
      if ( conn != null ) {
        conn.disconnect();
      }
    }
      `
    }
  ]
});
