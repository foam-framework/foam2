foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'Log',

  tableColumns: ['time', 'from', 'belong', 'type', 'description'],

  properties: [
    {
      class: 'String',
      name: 'id',
      factory: function() {
        return '' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);;
      }
    },
    {
      class: 'DateTime',
      name: 'time'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'belong',
      label: 'User ID'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'detail',
      view: { class: 'foam.u2.tag.TextArea', rows: 20 }
    }
  ]
})