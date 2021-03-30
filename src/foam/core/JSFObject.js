/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'JSFObject',
  extends: 'foam.core.FObjectProperty',

  documentation: `
    A Property which is only meaningful in JS.
    Is stored in Java as unresolved JSON.
    Avoid parse data in the server`
  ,

  properties: [
    ['javaJSONParser', 'new foam.lib.json.UnknownFObjectParser()']
  ]
});
