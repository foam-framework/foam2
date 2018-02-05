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

  imports: [ 'document', 'window', 'classloader' ],

  methods: [
    function init() {
      this.window.addEventListener('load', this.onLoad, false);
    },

    function findPropertyIC(cls, name) {
      var ps = cls.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        if ( name === ps[i].name.toLowerCase() ) return ps[i];
      }
    },

    function loadTag(el) {
      var clsName = el.getAttribute('class');

      this.classloader.load(clsName).then(function(cls) {
        var id  = el.id;

        var view = cls.create(null, foam.__context__);

        if ( view.toE ) {
          view = view.toE({}, foam.__context__);
        } else if ( ! foam.u2.Element.isInstance(view) )  {
          view = foam.u2.DetailView.create({data: view, showActions: true});
        }

        for ( var j = 0 ; j < el.attributes.length ; j++ ) {
          var attr = el.attributes[j];
          var p    = this.findPropertyIC(view.cls_, attr.name);
          if ( p ) p.set(view, attr.value);
        }

        el.outerHTML = view.outerHTML;
        view.load();

        // Store view in global variable if named. Useful for testing.
        if ( id ) global[id] = view;

      }.bind(this), function(e) {
        console.error(e);
        console.error('Failed to load class: ', clsName);
      });
    }
  ],

  listeners: [
    function onLoad() {
      var els = Array.from(this.document.getElementsByTagName('foam'));
      this.window.removeEventListener('load', this.onLoad);

      // Install last to first to avoid messing up the 'els' list.
      els.forEach(this.loadTag.bind(this));
    }
  ]
});

foam.u2.FoamTagLoader.create();
