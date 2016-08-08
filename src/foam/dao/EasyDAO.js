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
    ready to help. Simply <code>this.X.EasyDAO.create()</code> and set the flags
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

  requires: [
    'foam.dao.MDAO',
    'foam.dao.TimestampDAO',
    'foam.dao.JournalDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.CachingDAO',
    //'foam.core.dao.MergeDAO',
    //'foam.core.dao.MigrationDAO',
    //'foam.core.dao.StorageDAO',
    'foam.core.dao.SyncDAO',
    //'foam.core.dao.VersionNoDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DeDupDAO'
    //'foam.dao.EasyClientDAO',
    //'foam.dao.LoggingDAO',
    //'foam.dao.TimingDAO'
  ],

  help: 'A facade for easy DAO setup.',

  imports: [ 'document' ],

  properties: [
    {
      name: 'name',
      factory: function() { return this.of.id; },
      //documentation: "The developer-friendly name for this $$DOC{ref:'.'}."
    },
    {
      class: 'Boolean',
      name: 'seqNo',
      value: false,
      //documentation: "Have $$DOC{ref:'.'} use a sequence number to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      class: 'Boolean',
      name: 'guid',
      label: 'GUID',
      value: false,
      //documentation: "Have $$DOC{ref:'.'} generate guids to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      name: 'seqProperty',
      class: 'Property',
      //documentation: "The property on your items to use to store the sequence number or guid. This is required for $$DOC{ref:'.seqNo'} or $$DOC{ref:'.guid'} mode."
    },
    {
      class: 'Boolean',
      name: 'cache',
      value: false,
      //documentation: "Enable local caching of the $$DOC{ref:'DAO'}."
    },
    {
      class: 'Boolean',
      name: 'dedup',
      value: false,
      //documentation: "Enable value de-duplication to save memory when caching."
    },
//     {
//       class: 'Boolean',
//       name: 'logging',
//       value: false,
//       //documentation: "Enable logging on the $$DOC{ref:'DAO'}."
//     },
//     {
//       class: 'Boolean',
//       name: 'timing',
//       value: false,
//       //documentation: "Enable time tracking for concurrent $$DOC{ref:'DAO'} operations."
//     },
    {
      class: 'Boolean',
      name: 'contextualize',
      value: false,
      //documentation: "Contextualize objects on .find"
    },
//     {
//       class: 'Boolean',
//       name: 'cloning',
//       value: false,
//       //documentation: "True to clone results on select"
//     },
    {
      name: 'daoType',
      value: 'foam.dao.IDBDAO',
      //documentation: function() { /*
//           <p>Selects the basic functionality this $$DOC{ref:'foam.dao.EasyDAO'} should provide.
//           You can specify an instance of a DAO model definition such as
//           $$DOC{ref:'MDAO'}, or a constant indicating your requirements.</p>
//           <p>Choices are:</p>
//           <ul>
//             <li>$$DOC{ref:'.ALIASES',text:'IDB'}: Use IndexDB for storage.</li>
//             <li>$$DOC{ref:'.ALIASES',text:'LOCAL'}: Use local storage (for Chrome Apps, this will use local, non-synced storage).</li>
//             <li>$$DOC{ref:'.ALIASES',text:'SYNC'}: Use synchronized storage (for Chrome Apps, this will use Chrome Sync storage).</li>
//           </ul>
//        */}
    },
    {
      class: 'Boolean',
      name: 'autoIndex',
      value: false,
      //documentation: "Automatically generate an index."
    },
//     {
//       class: 'FObjectArray',
//       name: 'migrationRules',
//       of: 'foam.core.dao.MigrationRule',
//       //documentation: "Creates an internal $$DOC{ref:'MigrationDAO'} and applies the given array of $$DOC{ref:'MigrationRule'}."
//     },
    {
      class: 'Boolean',
      name: 'syncWithServer',
      value: false
    },
    {
      class: 'Boolean',
      name: 'syncPolling',
      value: true
    },
    {
      class: 'String',
      name: 'serverUri',
      factory: function() {
        return this.document && this.document.location ?
            this.document.location.origin + '/api' :
            '';
      }
    },
    {
      class: 'Boolean',
      name: 'isServer',
      value: false
    },
    {
      name: 'syncProperty'
    }
  ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      MDAO:  'foam.dao.MDAO',
      IDB:   'foam.dao.IDBDAO',
      LOCAL: 'foam.dao.LocalStorageDAO',
      //SYNC:  'foam.dao.StorageDAO'
    }
  },

  methods: [
    function init(args) {
      /*
        <p>On initialization, the $$DOC{ref:'.'} creates an appropriate chain of
        internal $$DOC{ref:'DAO'} instances based on the $$DOC{ref:'.'}
        property settings.</p>
        <p>This process is transparent to the developer, and you can use your
        $$DOC{ref:'.'} like any other $$DOC{ref:'DAO'}.</p>
      */
      this.SUPER(args);

//       if ( window.chrome && chrome.storage ) {
//         this.ALIASES.LOCAL = 'foam.core.dao.ChromeStorageDAO';
//         this.ALIASES.SYNC  = 'foam.core.dao.ChromeSyncStorageDAO';
//       }

      var daoType = typeof this.daoType === 'string' ?
        this.ALIASES[this.daoType] || this.daoType :
        this.daoType;

      var daoModel = typeof daoType === 'string' ?
        this.lookup(daoType) || global[daoType] :
        daoType;

      var params = { of: this.of, autoIndex: this.autoIndex };

      if ( ! daoModel ) {
        this.warn(
          "EasyDAO: Unknown DAO Type.  Add '" + daoType + "' to requires: list."
        );
      }

      if ( this.name  ) params.name = this.name;
      if ( this.seqNo || this.guid ) params.property = this.seqProperty;

      var dao = daoModel.create(params, this.__subContext__);

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

//       var cls = this.of$cls;

//       if ( this.syncWithServer && this.isServer ) throw "isServer and syncWithServer are mutually exclusive.";

//       if ( this.syncWithServer || this.isServer ) {
//         if ( ! this.syncProperty ) {
//           this.syncProperty = cls.SYNC_PROPERTY;
//           if ( ! this.syncProperty ) {
//             throw "EasyDAO sync with class " + cls.id + " invalid. Sync requires a sync property be set, or be of a class including a property 'sync_property'.";
//           }
//         }
//       }

//       if ( this.syncWithServer ) {
//         dao = this.SyncDAO.create({
//           remoteDAO: this.EasyClientDAO.create({
//             serverUri: this.serverUri,
//             cls: cls,
//             sockets: this.sockets,
//             reconnectPeriod: 5000
//           }),
//           syncProperty: this.syncProperty,
//           delegate: dao,
//           period: 1000
//         });
//         dao.syncRecordDAO = foam.dao.EasyDAO.create({
//           of: dao.SyncRecord,
//           cache: true,
//           daoType: this.daoType,
//           name: this.name + '_SyncRecords'
//         });
//       }

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

//       if ( this.timing  ) dao = this.TimingDAO.create({ name: this.of.id + 'DAO', delegate: dao });
//       if ( this.logging ) dao = this.LoggingDAO.create({ delegate: dao });

      this.delegate = dao;
    },

    function addIndex() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addIndex', text:'MDAO.addIndex()'}.</p> */
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    },

    function addRawIndex() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addRawIndex', text:'MDAO.addRawIndex()'}. */
      this.mdao && this.mdao.addRawIndex.apply(this.mdao, arguments);
      return this;
    }
  ]
});
