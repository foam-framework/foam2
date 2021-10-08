/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'TreeAltView',
  extends: 'foam.u2.view.AltView',

  requires: [
    'foam.nanos.menu.Menu',
    'foam.u2.view.TableView'
  ],

  properties: [
    'relationship'
  ],

  methods: [
    function init(){
      var relationship = typeof this.relationship === 'object' ? 
        relationship :
        foam.lookup(this.relationship);

      this.views = [
        [
          { 
            class: 'foam.u2.view.TableView'
          },
         'Table'
        ],
        [ {
            class: 'foam.u2.view.TreeView',
            relationship: relationship,
            startExpanded: true,
            formatter: function(data) { this.add(data.label); }
          }, 'Tree' ]
      ]
    }
  ]
});
