/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [ 'tableCellFormatter', 'tableCellView', 'tableWidth', 'attribute', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Currency',
  properties: [ 'tableCellFormatter' , 'precision' ]
});
foam.CLASS({
  refines: 'foam.core.Date',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  refines: 'foam.core.DateTime',
  properties: [ 'tableCellFormatter', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Double',
  properties: [ 'tableCellFormatter', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Enum',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Float',
  properties: [ 'view' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectArray',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Int',
  properties: [ 'attribute' ]
});
foam.CLASS({
  refines: 'foam.core.Long',
  properties: [ 'tableCellFormatter', 'visibility', 'tableWidth' ]
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'javaCode' ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [ 'tableProperties', 'tableColumns', 'generateJava', 'searchColumns', 'tableCellFormatter', 'css', 'import', 'description' ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [ 'tableCellFormatter', 'searchView', 'attribute', 'view' ]
});
foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'tableCellFormatter', 'tableCellView', 'displayWidth', 'view', 'visibility', 'tableWidth', 'description' ]
});
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddressDetailView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PhoneDetailView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',
  properties: [ 'code' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Element',
  methods: [ 
    function initE() { }
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Tab'
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Tabs',
  methods: [ 
    function add() { },
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'TextField',
  methods: [ 
    function fromProperty() { } ,
    function load() { },
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FloatView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  methods: [ 
    function fromProperty() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Input',
  methods: [ 
    function initE() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Select',
  methods: [ 
    function initE() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'TextArea',
  methods: [ 
    function initE() { } ,
    function load() { },
  ],
});
foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform'
});
foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas'
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'javaCode' ]
});
