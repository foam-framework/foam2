/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewSpecWithJava',
  extends: 'foam.u2.ViewSpec',
  properties: [
    ['view', { class: 'foam.u2.view.MapView' }],
    ['type', 'foam.lib.json.UnknownFObject'],
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'new foam.lib.json.UnknownFObjectParser()'],
    // TODO: remove next line when permanently fixed in ViewSpec
    ['fromJSON', function fromJSON(value, ctx, prop, json) {
      return value;
    }]
  ]
});
