foam.CLASS({
  package: 'foam.u2',
  name: 'ModalWrapper',
  extends: 'foam.u2.View',
  
  documentation: `
    A wrapping utility model that wraps a given view with a given wrapper.
    Used in journal files for wrapping views in popup modals. Should be
    used when either the view or the wrapping modal has additional 
    arguments it needs to pass down.

    ex.
    "class": "foam.u2.ModalWrapper",
    "wrapper": {
      "class": "WrapperModel",
      "arg": "arg"
    },
    "view": {
      "class": "ViewModel",
      "arg": "arg"
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'wrapper',
      type: 'foam.lib.json.UnknownFObject',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    },
    {
      class: 'FObjectProperty',
      name: 'wrapperModel_',
      factory: function() {
        return foam.lookup(this.wrapper.class).create(this.wrapper, this);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      type: 'foam.lib.json.UnknownFObject',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .add(this.wrapperModel_.tag(this.view))
      .end();
    }
  ]
});