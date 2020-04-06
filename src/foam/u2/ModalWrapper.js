foam.CLASS({
  package: 'foam.u2',
  name: 'ModalWrapper',
  extends: 'foam.u2.View',
  
  documentation: `Wraps a given view with a given wrapper.`,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'wrapper',
      type: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    },
    {
      class: 'FObjectProperty',
      name: 'wrapperModel_',
      factory: function() {
        return (foam.lookup(this.wrapper.class)).create(this.wrapper, this);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      type: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .add(this.wrapperModel_.tag(this.view))
      .end()
    }
  ]
});