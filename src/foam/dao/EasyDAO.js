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

/**
    <p>If you don't know which DAO implementation to choose, EasyDAO is
    ready to help. Simply require foam.dao.EasyDAO and create() with the flags
    to indicate what behavior you're looking for. Under the hood, EasyDAO
    will create one or more DAO instances to service your requirements.
    </p>
    <p>Since EasyDAO is a proxy, just use it like you would any other
    DAO, without worrying about the internal DAO doing the work.
    </p>
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.dao.MDAO',
    'foam.dao.JournalDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.CachingDAO',
    'foam.dao.SyncDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.ClientDAO',
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
      LOCAL: 'foam.dao.LocalStorageDAO'
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
      name: 'journal',
      value: false
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
      /** The URI of the server to use. If sockets is true, this will use
        a web socket, otherwise HTTP to contact the server-side DAO. On your
        server, use an EasyDAO with isServer:true to provide the other end
        of the connection. */
      class: 'String',
      name: 'serverUri',
      factory: function() {
        return this.document && this.document.location ?
            this.document.location.origin + '/api' :
            '';
      }
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
      /** If true, uses sockets instead of HTTP for server communication. */
      name: 'sockets',
      value: false
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
      this.SUPER(args);

      var daoType = typeof this.daoType === 'string' ?
        this.ALIASES[this.daoType] || this.daoType :
        this.daoType;

      var daoModel = typeof daoType === 'string' ?
        this.lookup(daoType) || global[daoType] :
        daoType;

      var params = { of: this.of };

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
        var boxContext = this.Context.create();
        var boxSender = ( this.sockets ) ?
          this.SocketBox.create({
            address: this.serverUri
          }, boxContext) :
          this.HTTPBox.create({
             url: this.serverUri,
             method: 'POST'
          }, boxContext); // TODO: retry?
          //TODO: EasyClientDAO

        dao = this.SyncDAO.create({
          remoteDAO: this.ClientDAO.create({
              name: this.name,
              delegate: boxSender
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

      if ( this.journal ) {
        dao = this.JournalDAO.create({
          delegate: dao,
          journal: foam.dao.EasyDAO.create({
            of:      foam.dao.JournalEntry,
            daoType: this.daoType,
            seqNo:   true,
            name:    this.name + '_Journal'
          })
        });
      }

      if ( this.timing  ) {
        dao = this.TimingDAO.create({ name: this.name + 'DAO', delegate: dao });
      }

      if ( this.logging ) {
        dao = this.LoggingDAO.create({ delegate: dao });
      }

      this.delegate = dao;

      if ( this.testData ) {
        var self = this;
        this.select(this.COUNT()).then(function(c) {
          // Only load testData if DAO is empty
          if ( c.value ) return;

          foam.json.parse(self.testData, self.of).forEach(
            function(o) { self.put(o); }
          );
        });
      }
    },

    /** Only relevant if cache is true or if daoType
       was set to MDAO, but harmless otherwise. Generates an index
       for a query over all specified properties together.
       @arg var_args specify any number of Properties to be indexed.
    */
    function addPropertyIndex(/* foam.core.Property* */ var_args) {
      this.mdao && this.mdao.addPropertyIndex.apply(this.mdao, arguments);
      return this;
    },

    /** Only relevant if cache is true or if daoType
      was set to MDAO, but harmless otherwise. Adds an existing index
      to the MDAO.
      @arg index The index to add.
    */
    function addIndex(/* foam.dao.index.Index */ index) {
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    }
  ]
});
