/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web.model',
  name: 'Messageboard',

  tableColumns: [
    'id', 'title', 'createdDate', 'creator', 'starmark'
  ],

  imports: [
    'messageboardDAO',
    'user'
  ],

  javaImports: [ 'java.util.Date' ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'starmark',
      view: { class: 'foam.u2.CheckBox' }
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 100,
      width: 200
    },
    {
      class: 'String',
      name: 'creator',
      visibility: foam.u2.Visibility.RO,
      //value: this.user.firstName
    },
    {
      class: 'Date',
      name: 'createdDate',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();'
      // ,
      // tableCellFormatter: function(date) {
      //   this.add(date ? date.toISOString().substring(0,10) : '');
      // }
    },
    {
      class: 'String',
      name: 'content',
      view: { class: 'foam.u2.tag.TextArea', rows: 30, cols: 120}
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'messageboardFile',
      view: { class: 'foam.demos.net.nap.web.MessageboardForm' }
    }
  ]
});
