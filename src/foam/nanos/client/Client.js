/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.client',
  name: 'Client',

  documentation: 'Client for connecting to NANOS server.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Language',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.nanos.boot.NSpec',
    'foam.nanos.menu.Menu',
    'foam.nanos.script.Script',
    'foam.nanos.test.Test'
  ],

  exports: [
    'countryDAO',
    'groupDAO',
    'languageDAO',
    'menuDAO',
    'nSpecDAO',
    'permissionDAO',
    'regionDAO',
    'scriptDAO',
    'testDAO',
    'userDAO'
  ],

  properties: [
    {
      name: 'nSpecDAO',
      factory: function() {
        return this.createDAO({
          of: this.NSpec,
          seqNo: true,
          testData: [
            { name: 'http',   serve: false, serviceClass: 'foam.nanos.http.NanoHttpServer' },
            { name: 'log',    serve: false, serviceClass: 'foam.nanos.log.FileLogger' },
            { name: 'pmlog',  serve: false, serviceClass: 'foam.nanos.pm.DAOPMLogger' },
            { name: 'auth',   serve: true,  serviceClass: 'foam.nanos.auth.UserAndGroupAuthService' },
            { name: 'test',   serve: true,  serviceClass: 'foam.nanos.test.TestRunner' },
            { name: 'script', serve: true,  serviceClass: 'foam.nanos.script.ScriptRunner' },
            { name: 'cron',   serve: true,  serviceClass: 'foam.nanos.cron.CronRunner' }
          ]
        });
      }
    },

    {
      name: 'countryDAO',
      factory: function() {
        return this.createDAO({
          of: this.Country,
          testData: [
            { code: 'BR', name: 'Brazil' },
            { code: 'CA', name: 'Canada' },
            { code: 'CN', name: 'China' },
            { code: 'IN', name: 'India' },
            { code: 'JM', name: 'Jamacia' },
            { code: 'LB', name: 'Lebanon' },
            { code: 'MX', name: 'Mexico' },
            { code: 'RS', name: 'Serbia' },
            { code: 'TT', name: 'Trinidad and Tobago' },
            { code: 'UK', name: 'United Kingdom' },
            { code: 'US', name: 'USA' },
            { code: 'ZA', name: 'South Africa' }
          ]
        });
      }
    },

    {
      name: 'regionDAO',
      factory: function() {
        return this.createDAO({
          of: this.Region,
          testData: [
            { countryId: 'CA', code: 'ON', name: 'Ontario' },
            { countryId: 'CA', code: 'PQ', name: 'Quebec' }
          ]
        });
      }
    },

    {
      name: 'menuDAO',
      factory: function() {
        return this.createDAO({
          of: this.Menu,
          testData: [
            { id: 'admin',                           label: 'Admin',          handler: { class: 'foam.nanos.menu.TabsMenu' /*SubMenu*/ } },
              { parent: 'admin', id: 'auth',         label: 'Authentication', handler: { class: 'foam.nanos.menu.TabsMenu' } },
                { parent: 'auth', id: 'users',       label: 'Users',          handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'userDAO' } },
                { parent: 'auth', id: 'groups',      label: 'Groups',         handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'groupDAO' } },
                { parent: 'auth', id: 'permissions', label: 'Permissions',    handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'permissionDAO' }  },
                { parent: 'auth', id: 'countries',   label: 'Countries',      handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'countryDAO' } },
                { parent: 'auth', id: 'regions',     label: 'Regions',        handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'regionDAO' } },
                { parent: 'auth', id: 'lang',        label: 'Languages',      handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'languageDAO' } },
              { parent: 'admin', id: 'nspec',        label: 'Nano Services',  handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'nSpecDAO' }  },
              { parent: 'admin', id: 'menus',        label: 'Menus',          handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'menuDAO', summaryView: { class: 'foam.u2.view.TreeView', relationship: MenuRelationship, formatter: function() { this.add(this.data.label); } }  } },
              { parent: 'admin', id: 'scripts',      label: 'Scripts',        handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'scriptDAO' }  },
              { parent: 'admin', id: 'tests',        label: 'Tests',          handler: { class: 'foam.nanos.menu.DAOMenu', daoKey: 'testDAO' }  },
              { parent: 'admin', id: 'pm',           label: 'Performance' },
              { parent: 'admin', id: 'log',          label: 'View Logs' },
            { id: 'debug',                           label: 'Debug',         handler: { class: 'foam.nanos.menu.TabsMenu' } },
              { parent: 'debug', id: 'api',          label: 'API Reference' },
              { parent: 'debug', id: 'context',      label: 'Context Walker' },
              { parent: 'debug', id: 'data',         label: 'View Data' }
          ]
        });
      }
    },

    {
      name: 'userDAO',
      factory: function() {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: [
            { id: 1, firstName: 'Simon', lastName: 'Alexander', phone: '16133195312' }
          ]
        });
      }
    },

    {
      name: 'languageDAO',
      factory: function() {
        return this.createDAO({
          of: this.Language,
          testData: [
            { code: 'en', name: 'English' },
            { code: 'fr', name: 'French' }
          ]
        });
      }
    },

    {
      name: 'groupDAO',
      factory: function() {
        return this.createDAO({
          of: this.Group,
          seqNo: true,
          testData: [
            { id: 1, firstName: 'nanoPay Admin', lastName: 'nanoPay administration users' },
            { id: 2, firstName: 'Admin',         lastName: 'Administration users' },
            { id: 3, firstName: 'Tester',        lastName: 'Testers' },
            { id: 3, firstName: 'End User',      lastName: 'End users' }
          ]
        });
      }
    },

      {
        name: 'permissionDAO',
        factory: function() {
          return this.createDAO({
            of: this.Permission,
            testData: [
              { id: '*',         description: 'Do anything global permission.' },
              { id: 'menu.auth', description: 'Perform authentication related configuration.' }
            ]
          });
        }
      },

        {
          name: 'scriptDAO',
          factory: function() {
            return this.createDAO({
              of: this.Script,
              seqNo: true,
              testData: [
              ]
            });
          }
        },

        {
          name: 'testDAO',
          factory: function() {
            return this.createDAO({
              of: this.Test,
              seqNo: true,
              testData: [
              ]
            });
          }
        }

  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
