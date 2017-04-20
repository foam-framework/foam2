/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: function() {/*
    Facade for easily creating decorated DAOs.
    <p>
    Most DAOs are most easily created and configured with EasyDAO.
    Simply require foam.dao.EasyDAO and create() with the flags
    to indicate what behavior you're looking for. Under the hood, EasyDAO
    will create one or more DAO instances to service your requirements and then
  */},

  requires: [
    'foam.dao.MDAO',
    'foam.dao.JournalDAO',
    'foam.dao.JournaledDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.CachingDAO',
    'foam.dao.SyncDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DecoratedDAO',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.DeDupDAO',
    'foam.dao.ClientDAO',
    'foam.dao.PromisedDAO',
    'foam.box.Context',
    'foam.box.HTTPBox',
    'foam.box.SocketBox',
    //'foam.core.dao.MergeDAO',
    //'foam.core.dao.MigrationDAO',
    //'foam.core.dao.VersionNoDAO',
    //'foam.dao.EasyClientDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.TimingDAO'
  ],

  imports: [ 'document' ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      ARRAY: 'foam.dao.ArrayDAO',
      MDAO:  'foam.dao.MDAO',
      IDB:   'foam.dao.IDBDAO',
      LOCAL: 'foam.dao.LocalStorageDAO',
      CLIENT: 'foam.dao.ClientDAO'
    }
  },

  properties: [
    {
      /** The developer-friendly name for this EasyDAO. */
      name: 'name',
      factory: function() { return this.of.id; }
    },
    {
      /** This is set automatically when you create an EasyDAO.
        @private */
      name: 'delegate'
    },
    {
      /** Have EasyDAO use a sequence number to index items. Note that
        .seqNo and .guid features are mutually
        exclusive. */
      class: 'Boolean',
      name: 'seqNo',
      value: false
    },
    {
      /** Have EasyDAO generate guids to index items. Note that .seqNo and .guid features are mutually exclusive. */
      class: 'Boolean',
      name: 'guid',
      label: 'GUID',
      value: false
    },
    {
      /** The property on your items to use to store the sequence number or guid. This is required for .seqNo or .guid mode. */
      name: 'seqProperty',
      class: 'Property'
    },
    {
      /** Enable local in-memory caching of the DAO. */
      class: 'Boolean',
      name: 'cache',
      value: false
    },
    {
      /** Enable value de-duplication to save memory when caching. */
      class: 'Boolean',
      name: 'dedup',
      value: false,
    },
    {
      /** Keep a history of all state changes to the DAO. */
      name: 'journal'
    },
    {
      /** Enable logging on the DAO. */
      class: 'Boolean',
      name: 'logging',
      value: false,
    },
    {
      /** Enable time tracking for concurrent DAO operations. */
      class: 'Boolean',
      name: 'timing',
      value: false
    },
    {
      /** Contextualize objects on .find, re-creating them with this EasyDAO's
        exports, as if they were children of this EasyDAO. */
      class: 'Boolean',
      name: 'contextualize',
      value: false
    },
//     {
//       class: 'Boolean',
//       name: 'cloning',
//       value: false,
//       //documentation: "True to clone results on select"
//     },
    {
      /**
        <p>Selects the basic functionality this EasyDAO should provide.
        You can specify an instance of a DAO model definition such as
        MDAO, or a constant indicating your requirements.</p>
        <p>Choices are:</p>
        <ul>
          <li>IDB: Use IndexDB for storage.</li>
          <li>LOCAL: Use local storage.</li>
          <li>MDAO: Use non-persistent in-memory storage.</li>
        </ul>
      */
      name: 'daoType',
      value: 'foam.dao.IDBDAO'
    },
    {
      /** Automatically generate indexes as necessary, if using an MDAO or cache. */
      class: 'Boolean',
      name: 'autoIndex',
      value: false
    },
//     {
//       /** Creates an internal MigrationDAO and applies the given array of MigrationRule. */
//       class: 'FObjectArray',
//       name: 'migrationRules',
//       of: 'foam.core.dao.MigrationRule',
//     },
    {
      /** Turn on to activate synchronization with a server. Specify serverUri
        and syncProperty as well. */
      class: 'Boolean',
      name: 'syncWithServer',
      value: false
    },
    {
      /** Setting to true activates polling, periodically checking in with
        the server. If sockets are used, polling is optional as the server
        can push changes to this client. */
      class: 'Boolean',
      name: 'syncPolling',
      value: true
    },
    {
      /** Set to true if you are running this on a server, and clients will
        synchronize with this DAO. */
      class: 'Boolean',
      name: 'isServer',
      value: false
    },
    {
      /** The property to synchronize on. This is typically an integer value
        indicating the version last seen on the remote. */
      name: 'syncProperty'
    },
    {
      /** Destination address for server. */
      name: 'serverBox'
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.DAODecorator',
      name: 'decorators'
    },
    'testData'
  ],

  methods: [
    function init() {
      /**
        <p>On initialization, the EasyDAO creates an appropriate chain of
        internal EasyDAO instances based on the EasyDAO
        property settings.</p>
        <p>This process is transparent to the developer, and you can use your
        EasyDAO like any other DAO.</p>
      */
      this.SUPER.apply(this, arguments);

      var daoType = typeof this.daoType === 'string' ?
        this.ALIASES[this.daoType] || this.daoType :
        this.daoType;

      var daoModel = typeof daoType === 'string' ?
        this.lookup(daoType) || global[daoType] :
        daoType;

      var params = { of: this.of };

      if ( daoType == 'foam.dao.ClientDAO' ) {
        foam.assert(this.serverBox, 'EasyDAO client type requires a server box');
        params.delegate = this.serverBox;
      }

      if ( ! daoModel ) {
        this.warn(
          "EasyDAO: Unknown DAO Type.  Add '" + daoType + "' to requires: list."
        );
      }

      if ( this.name && daoModel.getAxiomByName('name') ) params.name = this.name;
      if ( daoModel.getAxiomByName('autoIndex') ) params.autoIndex = this.autoIndex;
      //if ( this.seqNo || this.guid ) params.property = this.seqProperty;

      var dao = daoModel.create(params, this.__subContext__);

      // Not used by decorators.
      delete params['name'];

      if ( this.MDAO.isInstance(dao) ) {
        this.mdao = dao;
        if ( this.dedup ) dao = this.DeDupDAO.create({delegate: dao});
      } else {
//         if ( this.migrationRules && this.migrationRules.length ) {
//           dao = this.MigrationDAO.create({
//             delegate: dao,
//             rules: this.migrationRules,
//             name: this.model.id + "_" + daoModel.id + "_" + this.name
//           });
//         }
        if ( this.cache ) {
          this.mdao = this.MDAO.create(params);
          dao = this.CachingDAO.create({
            cache: this.dedup ?
              this.mdao :
              this.DeDupDAO.create({delegate: this.mdao}),
            src: dao,
            of: this.model});
        }
      }

      if ( this.journal ) {
        dao = this.JournaledDAO.create({
          delegate: dao,
          journal: this.journal
        });
      }

      if ( this.seqNo && this.guid ) throw "EasyDAO 'seqNo' and 'guid' features are mutually exclusive.";

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, of: this.of};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.SequenceNumberDAO.create(args);
      }

      if ( this.guid ) {
        var args = {__proto__: params, delegate: dao, of: this.of};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.GUIDDAO.create(args);
      }

      var cls = this.of;

      if ( this.syncWithServer && this.isServer ) throw "isServer and syncWithServer are mutually exclusive.";

      if ( this.syncWithServer || this.isServer ) {
        if ( ! this.syncProperty ) {
          this.syncProperty = cls.SYNC_PROPERTY;
          if ( ! this.syncProperty ) {
            throw "EasyDAO sync with class " + cls.id + " invalid. Sync requires a sync property be set, or be of a class including a property 'sync_property'.";
          }
        }
      }

      if ( this.syncWithServer ) {
        foam.assert(this.serverBox, 'syncWithServer requires serverBox');

        dao = this.SyncDAO.create({
          remoteDAO: this.ClientDAO.create({
              name: this.name,
              delegate: this.serverBox
          }, boxContext),
          syncProperty: this.syncProperty,
          delegate: dao,
          pollingFrequency: 1000
        });
        dao.syncRecordDAO = foam.dao.EasyDAO.create({
          of: dao.SyncRecord,
          cache: true,
          daoType: this.daoType,
          name: this.name + '_SyncRecords'
        });
      }

//       if ( this.isServer ) {
//         dao = this.VersionNoDAO.create({
//           delegate: dao,
//           property: this.syncProperty,
//           version: 2
//         });
//       }

      if ( this.contextualize ) {
        dao = this.ContextualizingDAO.create({delegate: dao});
      }

      if ( this.decorators.length ) {
        var decorated = this.DecoratedDAO.create({
          decorator: this.CompoundDAODecorator.create({
            decorators: this.decorators
          }),
          delegate: dao
        });
        dao = decorated;
      }

      if ( this.timing  ) {
        dao = this.TimingDAO.create({ name: this.name + 'DAO', delegate: dao });
      }

      if ( this.logging ) {
        dao = this.LoggingDAO.create({ delegate: dao });
      }

      var self = this;

      if ( decorated ) decorated.dao = dao;

      if ( this.testData ) {
        var delegate = dao;

        dao = this.PromisedDAO.create({
          promise: new Promise(function(resolve, reject) {
            delegate.select(self.COUNT()).then(function(c) {
              console.log("Loading test data");
              // Only load testData if DAO is empty
              if ( c.value ) {
                resolve(delegate);
                return;
              }

              Promise.all(foam.json.parse(self.testData, self.of).map(
                function(o) { return delegate.put(o); }
              )).then(function() {
                console.log("Loaded", self.testData.length, "records.");
                resolve(delegate);
              }, reject);
            });
          })
        });
      }

      this.delegate = dao;
    },

    /** Only relevant if cache is true or if daoType
       was set to MDAO, but harmless otherwise. Generates an index
       for a query over all specified properties together.
       @param var_args specify any number of Properties to be indexed.
    */
    function addPropertyIndex() {
      this.mdao && this.mdao.addPropertyIndex.apply(this.mdao, arguments);
      return this;
    },

    /** Only relevant if cache is true or if daoType
      was set to MDAO, but harmless otherwise. Adds an existing index
      to the MDAO.
      @param index The index to add.
    */
    function addIndex(index) {
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    }
  ]
});
