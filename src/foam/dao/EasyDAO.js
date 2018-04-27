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
    'foam.box.Context',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.box.SocketBox',
    'foam.box.WebSocketBox',
    'foam.box.TimeoutBox',
    'foam.box.RetryBox',
    'foam.dao.CachingDAO',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DecoratedDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.JDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.MDAO',
    'foam.dao.PromisedDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.SyncDAO',
    'foam.dao.TimingDAO'
  ],

  imports: [ 'document' ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      ARRAY:  'foam.dao.ArrayDAO',
      CLIENT: 'foam.dao.RequestResponseClientDAO',
      IDB:    'foam.dao.IDBDAO',
      LOCAL:  'foam.dao.LocalStorageDAO',
      MDAO:   'foam.dao.MDAO'
    }
  },

  properties: [
    {
      /** The developer-friendly name for this EasyDAO. */
      class: 'String',
      name: 'name',
      factory: function() { return this.of.id; }
    },
    {
      /** This is set automatically when you create an EasyDAO.
        @private */
      name: 'delegate',
      javaFactory: `
foam.dao.DAO delegate = getInnerDAO() == null ?
  new foam.dao.MapDAO(getX(), getOf()) :
  getInnerDAO();

if ( delegate instanceof foam.dao.MDAO ) setMdao((foam.dao.MDAO)delegate);

if ( getJournaled() ) {
  delegate = new foam.dao.JDAO(getX(), delegate, getJournalName());
}

if ( getGuid() && getSeqNo() ) {
  throw new RuntimeException("EasyDAO GUID and SeqNo are mutually exclusive");
}

if ( getGuid() ) {
  delegate = new foam.dao.GUIDDAO.Builder(getX()).setDelegate(delegate).build();
}

if ( getSeqNo() ) {
  delegate = new foam.dao.SequenceNumberDAO.Builder(getX()).
    setDelegate(delegate).
    setProperty(getSeqPropertyName()).
    build();
}

if ( getContextualize() ) {
  delegate = new foam.dao.ContextualizingDAO.Builder(getX()).
    setDelegate(delegate).
    build();
}

if ( getAuthenticate() ) {
  delegate = new foam.dao.AuthenticatedDAO(
    getName(),
    getAuthenticateRead(),
    delegate);
}

if ( getPm() ) {
  delegate = new foam.dao.PMDAO(delegate);
}

return delegate;
`
    },
    {
      class: 'Object',
      javaType: 'foam.dao.DAO',
      name: 'innerDAO'
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
      class: 'String',
      name: 'seqPropertyName',
      value: 'id'
    },
    {
      /** The property on your items to use to store the sequence number or guid. This is required for .seqNo or .guid mode. */
      name: 'seqProperty',
      generateJava: false,
      class: 'Property'
    },
    {
      /** Enable local in-memory caching of the DAO. */
      class: 'Boolean',
      name: 'cache',
      generateJava: false,
      value: false
    },
    {
      /** Enable standard authentication. */
      class: 'Boolean',
      name: 'authenticate',
      value: true
    },
    {
      /** Enable standard read authentication. */
      class: 'Boolean',
      name: 'authenticateRead',
      value: true
    },
    {
      /** Enable value de-duplication to save memory when caching. */
      class: 'Boolean',
      name: 'dedup',
      generateJava: false,
      value: false,
    },
    {
      /** Keep a history of all state changes to the DAO. */
      class: 'Boolean',
      name: 'journaled',
      value: false
    },
    {
      class: 'String',
      name: 'journalName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      generateJava: false,
      name: 'journal'
    },
    {
      /** Enable logging on the DAO. */
      class: 'Boolean',
      name: 'logging',
      value: false,
      generateJava: false
    },
    {
      /** Enable time tracking for concurrent DAO operations. */
      class: 'Boolean',
      name: 'timing',
      generateJava: false,
      value: false
    },
    {
      class: 'Boolean',
      name: 'pm',
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
      generateJava: false,
      value: 'foam.dao.IDBDAO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.MDAO',
      name: 'mdao'
    },
    {
      /** Automatically generate indexes as necessary, if using an MDAO or cache. */
      class: 'Boolean',
      generateJava: false,
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
      generateJava: false,
      value: false
    },
    {
      /** Turn on to enable remote listener support. Only useful with daoType = CLIENT. */
      class: 'Boolean',
      generateJava: false,
      name: 'remoteListenerSupport',
      value: false
    },
    {
      /** Setting to true activates polling, periodically checking in with
        the server. If sockets are used, polling is optional as the server
        can push changes to this client. */
      class: 'Boolean',
      generateJava: false,
      name: 'syncPolling',
      value: true
    },
    {
      /** Set to true if you are running this on a server, and clients will
        synchronize with this DAO. */
      class: 'Boolean',
      generateJava: false,
      name: 'isServer',
      value: false
    },
    {
      /** The property to synchronize on. This is typically an integer value
        indicating the version last seen on the remote. */
      name: 'syncProperty',
      generateJava: false
    },
    {
      /** Destination address for server. */
      name: 'serverBox',
      generateJava: false,
      factory: function() {
        // TODO: This should come from the server via a lookup from a NamedBox.
        return this.SessionClientBox.create({ delegate: this.RetryBox.create({ delegate:
          this.TimeoutBox.create({ delegate:
          this.remoteListenerSupport ?
              this.WebSocketBox.create({ uri: this.serviceName }) :
              this.HTTPBox.create({ url: this.serviceName })
        })})});
      }
    },
    {
      /** Simpler alternative than providing serverBox. */
      name: 'serviceName',
      generateJava: false
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.DAODecorator',
      generateJava: false,
      name: 'decorators'
    },
    {
      name: 'testData',
      generateJava: false
    }
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

      var params = { of: this.of };

      if ( daoType == 'foam.dao.RequestResponseClientDAO' ) {
        foam.assert(this.hasOwnProperty('serverBox') || this.serviceName, 'EasyDAO "client" type requires a serveBox or serviceName');

        // The RequestResonseClientDAO generates listener events locally
        // but with remoteListenerSupport, this isn't needed, so switch
        // to the regular ClientDAO instead.
        if ( this.remoteListenerSupport ) {
          daoType = 'foam.dao.ClientDAO';
        }

        params.delegate = this.serverBox;
      }

      var daoModel = typeof daoType === 'string' ?
        this.lookup(daoType) || global[daoType] :
        daoType;

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
          this.mdao = this.MDAO.create({of: params.of});
          dao = this.CachingDAO.create({
            cache: this.dedup ?
              this.mdao :
              this.DeDupDAO.create({delegate: this.mdao}),
            src: dao,
            of: this.model});
        }
      }

      if ( this.journal ) {
        dao = this.JDAO.create({
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
          remoteDAO: this.RequestResponseClientDAO.create({
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
              // Only load testData if DAO is empty
              if ( c.value ) {
                resolve(delegate);
                return;
              }

              self.log("Loading test data");
              Promise.all(foam.json.parse(self.testData, self.of, self).map(
                function(o) { return delegate.put(o); }
              )).then(function() {
                self.log("Loaded", self.testData.length, "records.");
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
    {
      name: 'addPropertyIndex',
      returns: 'foam.dao.EasyDAO',
      javaReturns: 'foam.dao.EasyDAO',
      args: [ { javaType: 'foam.core.PropertyInfo', name: 'prop' } ],
      code:     function addPropertyIndex() {
        this.mdao && this.mdao.addPropertyIndex.apply(this.mdao, arguments);
        return this;
      },
      javaCode: `
if ( getMdao() != null ) {
  getMdao().addIndex(prop);
}
return this;
`
    },

    /** Only relevant if cache is true or if daoType
      was set to MDAO, but harmless otherwise. Adds an existing index
      to the MDAO.
      @param index The index to add.
    */
    {
      name: 'addIndex',
      returns: 'foam.dao.EasyDAO',
      javaReturns: 'foam.dao.EasyDAO',
      args: [ { javaType: 'foam.dao.index.Index', name: 'index' } ],
      code: function addIndex(index) {
        this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
        return this;
      },
      javaCode: `
if ( getMdao() != null ) {
  getMdao().addIndex(index);
}
return this;
`
    }
  ]
});
