/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2018 The FOAM Authors.  All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FoamTagLoader',

  documentation: 'Converts <foam> tags in document into Views.',

  imports: [ 'classloader', 'document', 'window' ],

  methods: [
    function init() {
      this.window.addEventListener('load', this.onLoad, false);
    },

    function findPropertyIC(cls, name) {
      var ps = cls.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        if ( name == ps[i].name.toLowerCase() ) return ps[i];
      }
    },

    function loadTag(el) {
      var clsName = el.getAttribute('class');

      this.classloader.load(clsName).then(function(cls) {
        var obj = cls.create(null, foam.__context__);

        this.setAttributes(el, obj);

        if ( obj.promiseE ) {
          obj.promiseE().then(function(view) { this.installView(el, view); });
        } else if ( obj.toE ) {
          this.installView(el, obj.toE({}, obj));
        } else if ( ! foam.u2.Element.isInstance(view) )  {
          installView(el, foam.u2.DetailView.create({data: view, showActions: true}));
        }
      }.bind(this), function(e) {
        console.error(e);
        console.error('Failed to load class: ', clsName);
      });
    },

    function installView(el, view) {
      var id = el.id;

      // this.setAttributes(el, view);

      el.outerHTML = view.outerHTML;
      view.load();

      // Store view in global variable if named. Useful for testing.
      if ( id ) global[id] = view;
    },

    function setAttributes(el, obj) {
      for ( var j = 0 ; j < el.attributes.length ; j++ ) {
        var attr = el.attributes[j];
        var p    = this.findPropertyIC(obj.cls_, attr.name);
        if ( p ) p.set(obj, attr.value);
      }
    }
  ],

  listeners: [
    function onLoad() {
      var els = Array.from(this.document.getElementsByTagName('foam'));
      this.window.removeEventListener('load', this.onLoad);

      els.forEach(this.loadTag.bind(this));
    }
  ]
});


foam.SCRIPT({
  package: 'foam.u2',
  name: 'FoamTagLoaderScript',
  requires: [ 'foam.u2.FoamTagLoader' ],
  flags: [ 'web' ],
  code: function() { foam.u2.FoamTagLoader.create(); }
});
