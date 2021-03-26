/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportDriverRegistry',
  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  imports:[
    'auth'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.core.X'
  ],

  documentation: 'Export driver registry model',

  tableColumns: [ 'id', 'driverName', 'targetModel', 'extension' ],

  properties: [
    { class: 'String', name: 'id', tableWidth: 80 },
    { class: 'String', name: 'driverName', tableWidth: 300 },
    { class: 'String', name: 'targetModel' },
    {
      class: 'String',
      name: 'extension',
      value: 'csv',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'mimeType',
      value: 'text/csv;charset=utf-8'
    },
    {
      class: 'Boolean',
      name: 'isConvertible'
    },
    {
      class: 'Boolean',
      name: 'isDownloadable'
    },
    {
      class: 'Boolean',
      name: 'isOpenable'
    },
    {
      class: 'Boolean',
      name: 'exportAllColumns',
      documentation: 'exportAllColumns should be set to true for export drivers, which handle both selected column export and export of all available columns'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      getter: function() {
        if ( ! this.availablePermissions || this.availablePermissions.length == 0 ) {
          return true;
        }
        return Promise.all(this.availablePermissions.map(p => this.auth.check(null, p))).then((values) => {
          for ( var v of values ) {
            if ( v )
              return true;
          }
          return false;
        });
      },
      javaGetter: `
        if ( getAvailablePermissions() == null || getAvailablePermissions().length == 0 )
          return true;
        X x = foam.core.XLocator.get();
        AuthService authService = (AuthService) x.get("auth");
        for ( String p: getAvailablePermissions() ) {
          if ( authService.check(x, p) ) {
            return true;
          }
        }
        return false;
      `
    },
    {
      class: 'StringArray',
      name: 'availablePermissions',
      documentation: `Permissions required for the export driver to be available.
        If empty than no permissions are required.`
    }
  ]
});
