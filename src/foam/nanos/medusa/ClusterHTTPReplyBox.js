/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterHTTPReplyBox',
  implements: ['foam.box.Box'],

  documentation: 'Reply Box specific to clustering whereby clusterTransient properties are not marshalled.',

  methods: [
    {
      name: 'send',
      code: function(m) {
        throw 'unimplemented';
      },
      swiftCode: 'throw FoamError("unimplemented")',
      javaCode: `
      try {
        javax.servlet.http.HttpServletResponse response =
         (javax.servlet.http.HttpServletResponse) getX().get("httpResponse");
        response.setContentType("application/json");
        java.io.PrintWriter writer = response.getWriter();
        writer.print(new foam.lib.json.Outputter(getX()).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate()).stringify(msg));
        writer.flush();
      } catch(java.io.IOException e) {
        throw new RuntimeException(e);
      }
      `
    }
  ]
});
