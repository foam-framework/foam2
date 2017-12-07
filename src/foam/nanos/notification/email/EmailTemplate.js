/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplate',

  documentation: 'Represents an email template',

  javaImports: [
    'java.nio.charset.StandardCharsets'
  ],

  tableColumns: [ 'name', 'group' ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Template name'
    },
    {
      class: 'String',
      name: 'group',
      value: '*'
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Template body',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150 },
      javaSetter:
`body_ = val;
bodyIsSet_ = true;
bodyAsByteArray_ = null;
bodyAsByteArrayIsSet_ = false;`
    },
    {
      class: 'Array',
      name: 'bodyAsByteArray',
      hidden: true,
      transient: true,
      javaType: 'byte[]',
      javaFactory: 'return getBody() != null ? getBody().getBytes(StandardCharsets.UTF_8) : null;'
    }
  ]
});
