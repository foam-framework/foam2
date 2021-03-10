/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'JSFObject',
  extends: 'foam.core.Property',

  documentation: `
    Add properties to an object allowing the server to handle it.
    Avoid parse data in the server`
  ,

  properties: [
    ['type', 'foam.lib.json.UnknownFObject'],
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.UnknownFObjectParser()'],
    ['fromJSON', function fromJSON(value, ctx, prop, json) {
      return value;
    }],
  ]
});
