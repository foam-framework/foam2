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

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.boot.NSpecAware'
  ],

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
    'foam.box.RetryBox',
    'foam.box.SessionClientBox',
    'foam.box.SocketBox',
    'foam.box.TimeoutBox',
    'foam.box.WebSocketBox',
    'foam.dao.CachingDAO',
    'foam.dao.ClientDAO',
    'foam.dao.CompoundDAODecorator',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.InterceptedDAO',
    'foam.dao.DAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    {
      path: 'foam.dao.JDAO',
      flags: ['js'],
    },
    {
      name: 'JDAOJava',
      path: 'foam.dao.java.JDAO',
      flags: ['java'],
    },
    'foam.dao.MDAO',
    'foam.dao.OrderedDAO',
    'foam.dao.PromisedDAO',
    'foam.dao.TTLCachingDAO',
    'foam.dao.TTLSelectCachingDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.SyncDAO',
    'foam.dao.TimingDAO',
    'foam.dao.JournalType',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.crunch.box.CrunchClientBox',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.LoggingDAO'
  ],

  imports: [ 'document', 'log' ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  constants: [
    {
      documentation: 'Aliases for daoType',
      name: 'aliases',
      flags: [ 'js' ],
      value: {
        ARRAY:  'foam.dao.ArrayDAO',
        CLIENT: 'foam.dao.RequestResponseClientDAO',
        IDB:    'foam.dao.IDBDAO',
        LOCAL:  'foam.dao.LocalStorageDAO',
        MDAO:   'foam.dao.MDAO'
      }
    }
  ],

  properties: [
    {
      documentation: 'The developer-friendly name for this EasyDAO',
      class: 'String',
      name: 'name',
      factory: function() {
        return this.nSpec && this.nSpec.name || this.of.id;
      },
      javaFactory: `
      if ( getNSpec() != null ) {
        return getNSpec().getName();
      } else if ( this.getOf() != null ) {
        return this.getOf().getId();
      }
      return "";
     `
    },
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    },
    {
      documentation: 'Hold Last usuable dao in decorator chain. For example, an MDAO wrapped in FixedSizeDAO should always go through the FixedSizeDAO and not update the MDAO directly.',
      name: 'lastDao',
      class: 'foam.dao.DAOProperty'
    },
    {
      /** This is set automatically when you create an EasyDAO.
        @private */
      name: 'delegate',
      javaFactory: `
        // TODO: replace logger instantiation once javaFactory issue above is fixed
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new foam.nanos.logger.StdoutLogger();
        }

        logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);

        foam.dao.DAO delegate = getInnerDAO();
        if ( delegate == null ) {
          if ( getNullify() ) {
            delegate = new foam.dao.NullDAO(getX(), getOf());
          } else {
            if ( getMdao() == null ) {
              setMdao(new foam.dao.MDAO(getOf()));
            }
            delegate = getMdao();
            if ( getIndex() != null && getIndex().length > 0 ) {
              if ( delegate instanceof foam.dao.MDAO ) {
                ((foam.dao.MDAO) delegate).addIndex(getIndex());
              } else {
                logger.warning(getName(), "Index not added, no access to MDAO");
              }
            }
            if ( getFixedSize() != null ) {
              foam.dao.ProxyDAO fixedSizeDAO = (foam.dao.ProxyDAO) getFixedSize();
              fixedSizeDAO.setDelegate(getMdao());
              delegate = fixedSizeDAO;
              //setMdao(fixedSizeDAO);
            }
            if ( getJournalType().equals(JournalType.SINGLE_JOURNAL) ) {
              if ( getWriteOnly() ) {
                delegate = new foam.dao.WriteOnlyJDAO(getX(), delegate, getOf(), getJournalName());
              } else {
                delegate = new foam.dao.java.JDAO(getX(), delegate, getJournalName(), getCluster());
              }
            }
          }
        }

        if ( getGuid() && getSeqNo() )
          throw new RuntimeException("EasyDAO GUID and SeqNo are mutually exclusive");

        if ( getSeqNo() ) {
          delegate = new foam.dao.SequenceNumberDAO.Builder(getX()).
          setDelegate(delegate).
          setProperty(getSeqPropertyName()).
          setStartingValue(getSeqStartingValue()).
          build();
        }

        if ( getGuid() )
          delegate = new foam.dao.GUIDDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getMdao() != null &&
             getLastDao() == null ) {
          setLastDao(delegate);
        }

        if ( getCluster() &&
             getMdao() != null ) {
          logger.debug(getName(), "cluster", "delegate", delegate.getClass().getSimpleName());
          delegate = new foam.nanos.medusa.MedusaAdapterDAO.Builder(getX())
            .setNSpec(getNSpec())
            .setDelegate(delegate)
            .build();
        }

        if ( getServiceProviderAware() ) {
          delegate = new foam.nanos.auth.ServiceProviderAwareDAO.Builder(getX())
            .setDelegate(delegate)
            .build();

          // auto add index on spid
          DAO dao = (DAO) getMdao();
          if ( dao != null &&
               dao instanceof foam.dao.MDAO ) {
            PropertyInfo pInfo = (PropertyInfo) this.getOf().getAxiomByName("spid");
            if ( pInfo != null ) {
              ((foam.dao.MDAO)dao).addIndex(pInfo);
            } else {
              logger.warning(getName(), "Index not added. Property not found. spid");
            }
          } else {
            logger.warning(getName(), "Index not added on spid, no access to MDAO");
          }
        }

        delegate = getOuterDAO(delegate);

        if ( getDecorator() != null ) {
          if ( ! ( getDecorator() instanceof ProxyDAO ) ) {
            logger.error(getName(), "delegateDAO", getDecorator(), "not instanceof ProxyDAO");
            System.exit(1);
          }
          // The decorator dao may be a proxy chain
          ProxyDAO proxy = (ProxyDAO) getDecorator();
          while ( proxy.getDelegate() != null && proxy.getDelegate() instanceof ProxyDAO )
            proxy = (ProxyDAO) proxy.getDelegate();
          proxy.setDelegate(delegate);
          delegate = (ProxyDAO) getDecorator();
        }

        // set inner delegate_ to handle reentrant
        // DelegateFactory calls from subsequent DAOs which may
        // have init_ methods which in turn call getDelegate().
        delegateIsSet_ = true;
        delegate_ = new ProxyDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getApprovableAware() ) {
          var delegateBuilder = new foam.nanos.approval.ApprovableAwareDAO
            .Builder(getX())
            .setDaoKey(getName())
            .setOf(getOf())
            .setDelegate(delegate);
          if(approvableAwareServiceNameIsSet_)
            delegateBuilder.setServiceName(getApprovableAwareServiceName());

          delegate = delegateBuilder.build();

          if ( getApprovableAwareEnabled() ) {
            logger.warning("DEPRECATED: EasyDAO", getName(), "'approvableAwareEnabled' is deprecated. Please remove it from the nspec.");
          }
        }

        if ( getValidated() ) {
          if ( getValidator() != null )
            delegate = new foam.dao.ValidatingDAO(getX(), delegate, getValidator());
          else
            delegate = new foam.dao.ValidatingDAO(getX(), delegate, foam.core.ValidatableValidator.instance());
        }

        if ( getLifecycleAware() ) {
          delegate = new foam.nanos.auth.LifecycleAwareDAO.Builder(getX())
            .setDelegate(delegate)
            .setName(getPermissionPrefix())
            .build();
        }

        if ( getDeletedAware() ) {
          System.out.println("DEPRECATED: Will be completely removed after services journal migration script. No functionality as of now.");
        }

        if ( getRuler() ) {
          String name = foam.util.SafetyUtil.isEmpty(getRulerDaoKey()) ? getName() : getRulerDaoKey();
          delegate = new foam.nanos.ruler.RulerDAO(getX(), delegate, name);
        }

        if ( getCreatedAware() )
          delegate = new foam.nanos.auth.CreatedAwareDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getCreatedByAware() )
          delegate = new foam.nanos.auth.CreatedByAwareDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getLastModifiedAware() )
          delegate = new foam.nanos.auth.LastModifiedAwareDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getLastModifiedByAware() )
          delegate = new foam.nanos.auth.LastModifiedByAwareDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getCapable() )
          delegate = new foam.nanos.crunch.lite.CapableDAO.Builder(getX()).setDaoKey(getName()).setDelegate(delegate).build();

        if ( getContextualize() ) {
          delegate = new foam.dao.ContextualizingDAO.Builder(getX()).
          setDelegate(delegate).
          build();
        }

        if ( getOrder() != null && getOrder().length > 0 ) {
          // TODO: CompositeDAO or thenBy
          for ( foam.mlang.order.Comparator comp : getOrder() )
            delegate = delegate.orderBy(comp);
        }

        if ( getAuthorize() ) {
          delegate = new foam.nanos.auth.AuthorizationDAO.Builder(getX())
            .setDelegate(delegate)
            .setAuthorizer(getAuthorizer())
            .build();
        }

        if ( getHistory() ) {
          delegate = new foam.dao.history.HistoryDAO(getX(), getHistoryDAOKey(), delegate);
        }

        if ( getNSpec() != null &&
             getNSpec().getServe() &&
             ! getAuthorize() &&
             ! getReadOnly() )
          logger.warning("EasyDAO", getName(), "Served DAO should be Authorized, or ReadOnly");

        if ( getPermissioned() &&
            ( getNSpec() != null && getNSpec().getServe() ) )
          delegate = new foam.nanos.auth.PermissionedPropertyDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getReadOnly() )
          delegate = new foam.dao.ReadOnlyDAO.Builder(getX()).setDelegate(delegate).build();

        if ( getLogging() )
          delegate = new foam.nanos.logger.LoggingDAO.Builder(getX()).setNSpec(getNSpec()).setDelegate(delegate).build();

        /*
        if ( getPipelinePm() && ( delegate instanceof ProxyDAO ) )
          delegate = new foam.dao.PipelinePMDAO(getX(), getNSpec(), delegate);
          */
        if ( getPm() )
          delegate = new foam.dao.PMDAO.Builder(getX()).setNSpec(getNSpec()).setDelegate(delegate).build();

        // see comments above regarding DAOs with init_
        ((ProxyDAO)delegate_).setDelegate(delegate);
        return delegate_;
      `
    },
    {
      class: 'Object',
      type: 'foam.dao.DAO',
      name: 'innerDAO'
    },
    {
      class: 'Object',
      type: 'foam.dao.DAO',
      name: 'decorator'
    },
    {
      class: 'Boolean',
      documentation: 'Creates pipelinePMDAOs around each decorator to measure their performance',
      name: 'pipelinePm'
    },
    {
      documentation: 'Have EasyDAO use a sequence number to index items. Note that .seqNo and .guid features are mutuallyexclusive.',
      class: 'Boolean',
      name: 'seqNo'
    },
    {
      class: 'Long',
      name: 'seqStartingValue',
      value: 1
    },
    {
      documentation: 'Have EasyDAO generate guids to index items. Note that .seqNo and .guid features are mutually exclusive',
      class: 'Boolean',
      name: 'guid',
      label: 'GUID'
    },
    {
      class: 'String',
      name: 'seqPropertyName',
      value: 'id'
    },
    {
      documentation: 'The property on your items to use to store the sequence number or guid. This is required for .seqNo or .guid mode',
      name: 'seqProperty',
      generateJava: false,
      class: 'Property'
    },
    {
      documentation: 'Enable local in-memory caching of the DAO',
      class: 'Boolean',
      name: 'cache',
      generateJava: false
    },
    {
      documentation: 'Time to wait before purging cache on find().',
      class: 'Long',
      name: 'ttlPurgeTime',
      units: 'ms',
      generateJava: false
    },
    {
      documentation: 'Time to wait before purging cache on select().',
      class: 'Long',
      name: 'ttlSelectPurgeTime',
      units: 'ms',
      generateJava: false
    },
    {
      documentation: 'Enable authorization',
      class: 'Boolean',
      name: 'authorize',
      value: true
    },
    {
      class: 'Object',
      type: 'foam.nanos.auth.Authorizer',
      name: 'authorizer',
      javaFactory: `
      if ( foam.nanos.auth.Authorizable.class.isAssignableFrom(getOf().getObjClass()) ) {
        return new foam.nanos.auth.AuthorizableAuthorizer(getPermissionPrefix());
      } else {
        return new foam.nanos.auth.StandardAuthorizer(getPermissionPrefix());
      }
      `
    },
    {
      class: 'String',
      name: 'permissionPrefix',
      factory: function() {
        return this.of.name.toLowerCase();
      },
      javaFactory: `
      return this.getOf().getObjClass().getSimpleName().toLowerCase();
     `
    },
    {
      class: 'Boolean',
      name: 'readOnly'
    },
    {
      class: 'Boolean',
      name: 'writeOnly'
    },
    {
      documentation: 'Sets the inner dao to a nullDAO',
      class: 'Boolean',
      name: 'nullify'
    },
    {
      documentation: 'Wrap in PermissionedPropertiesDAO',
      class: 'Boolean',
      name: 'permissioned',
      javaFactory: `
      List<PropertyInfo> props = this.getOf().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo info : props ) {
        if ( info.getWritePermissionRequired() ||
             info.getReadPermissionRequired() ) {
          return true;
        }
      }
      return false;
     `
    },
    {
      documentation: 'Add a validatingDAO decorator',
      class: 'Boolean',
      name: 'validated'
    },
    {
      documentation: 'Validator for the validatingDAO decorator',
      class: 'FObjectProperty',
      of: 'foam.core.Validator',
      name: 'validator'
    },
    {
      documentation: 'Enable value de-duplication to save memory when caching',
      class: 'Boolean',
      name: 'dedup',
      generateJava: false
    },
    {
      documentation: 'Keep a history of all state changes to the DAO',
      class: 'foam.core.Enum',
      of: 'foam.dao.JournalType',
      name: 'journalType',
      value: 'NO_JOURNAL'
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
      documentation: 'Enable logging on the DAO',
      class: 'Boolean',
      name: 'logging'
    },
    {
      documentation: 'Enable time tracking for concurrent DAO operations',
      class: 'Boolean',
      name: 'timing'
    },
    {
      class: 'Boolean',
      name: 'pm'
    },
    {
      class: 'Boolean',
      name: 'history',
      documentation: `Enables storing history of object property changes.`
    },
    {
      class: 'String',
      name: 'historyDAOKey',
      documentation: `HistoryDAO key referencing where history objects will be stored, useful when seperating history journals from each other.`,
      javaValue: `"historyDAO"`
    },
    {
      documentation: 'Contextualize objects on .find, re-creating them with this EasyDAO\'s exports, as if they were children of this EasyDAO.',
      class: 'Boolean',
      name: 'contextualize'
    },
    {
      class: 'Boolean',
      name: 'ruler',
      value: true
    },
    {
      class: 'String',
      name: 'rulerDaoKey'
    },
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
      class: 'foam.dao.DAOProperty',
      name: 'mdao'
    },
    {
      documentation: 'Automatically generate indexes as necessary, if using an MDAO or cache',
      class: 'Boolean',
      generateJava: false,
      name: 'autoIndex',
      documentation: 'not currently supported'
    },
    {
      documentation: 'Turn on to activate synchronization with a server. Specify serverUri and syncProperty as well',
      class: 'Boolean',
      name: 'syncWithServer',
      generateJava: false
    },
    {
      documentation: 'Turn on to enable remote listener support. Only useful with daoType = CLIENT',
      class: 'Boolean',
      generateJava: false,
      name: 'remoteListenerSupport'
    },
    {
      documentation: 'Setting to true activates polling, periodically checking in with the server. If sockets are used, polling is optional as the server can push changes to this client',
      class: 'Boolean',
      generateJava: false,
      name: 'syncPolling',
      value: true
    },
    {
      documentation: 'Set to true if you are running this on a server, and clients will synchronize with this DAO',
      class: 'Boolean',
      generateJava: false,
      name: 'isServer'
    },
    {
      documentation: 'The property to synchronize on. This is typically an integer value indicating the version last seen on the remote',
      name: 'syncProperty',
      generateJava: false
    },
    {
      name: 'retryBoxMaxAttempts',
      class: 'Boolean',
      generateJava: false,
    },
    {
      name: 'crunchBoxEnabled',
      generateJava: false,
      value: true
    },
    {
      documentation: 'Destination address for server',
      name: 'serverBox',
      generateJava: false,
      factory: function() {
        // TODO: This should come from the server via a lookup from a NamedBox.
        var box = this.TimeoutBox.create({
          delegate: this.remoteListenerSupport ?
            this.WebSocketBox.create({ uri: this.serviceName }) :
            this.HTTPBox.create({ url: this.serviceName })
        });
        if ( this.retryBoxMaxAttempts != 0 ) {
          box = this.RetryBox.create({
            maxAttempts: this.retryBoxMaxAttempts,
            delegate: box,
          })
        }
        if ( this.crunchBoxEnabled ) {
          box = this.CrunchClientBox.create({ delegate: box });
        }
        return this.SessionClientBox.create({ delegate: box });
      }
    },
    {
      documentation: 'Cluster this DAO',
      name: 'cluster',
      class: 'Boolean',
      javaFactory: `
      return foam.util.SafetyUtil.equals("true", System.getProperty("CLUSTER", "false"));
      `
    },
    {
      documentation: 'Simpler alternative than providing serverBox.',
      name: 'serviceName',
      class: 'String',
      generateJava: false
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      generateJava: false,
      name: 'decorators'
    },
    {
      class: 'FObjectArray',
      of: 'foam.mlang.order.Comparator',
      name: 'order'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.PropertyInfo',
      name: 'index'
    },
    {
      name: 'testData',
      generateJava: false
    },
    {
      documentation: 'Enables automated adding of property-related DAO decorators to qualifying decorator chains',
      name: 'enableInterfaceDecorators',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'Decorate with a ServiceProviderAwareDAO',
      name: 'serviceProviderAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.ServiceProviderAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      /* deprecated */
      documentation: `More documentation in ServiceProviderAwareDAO.
A map of class and PropertyInfos used by the ServiceProviderAwareDAO
to traverse a hierarchy of models in search of a ServiceProviderAware
model from which to test ServiceProvider ID (spid)`,
      name: 'serviceProviderAwarePropertyInfos',
      class: 'Map'
    },
    {
      name: 'lifecycleAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.LifecycleAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'createdAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.CreatedAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'createdByAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.CreatedByAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'lastModifiedAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.LastModifiedAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'lastModifiedByAware',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.auth.LastModifiedByAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'capable',
      class: 'Boolean',
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.crunch.lite.Capable.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'fixedSize',
      class: 'FObjectProperty',
      of: 'foam.dao.FixedSizeDAO'
    },
    {
      name: 'approvableAware',
      class: 'Boolean',
      documentation: `
        Denotes if a model is approvable aware, and if so it should ALWAYS have this decorator on,
        if an object is ApprovableAware but the user want the object to skip the checker/approval
        phase, they should set the object checkerPredicate such that it is evaluated to false.

        Setting easyDAO.approvableAware to false, on the other hand, would opt-out the decorator
        (ie. ApprovableAwareDAO) completely and since ApprovableAware interface implements
        LifecycleAware the lifecycleState property on the object will not be changed to ACTIVE.
      `,
      javaFactory: 'return getEnableInterfaceDecorators() && foam.nanos.approval.ApprovableAware.class.isAssignableFrom(getOf().getObjClass());'
    },
    {
      name: 'approvableAwareEnabled',
      class: 'Boolean',
      documentation: `
        DEPRECATING: Will be removed after services migration. Please use 'approvableAware' instead.
      `,
      javaFactory: 'return false;'
    },
    {
      name: 'deletedAware',
      class: 'Boolean',
      documentation: `
        DEPRECATING: Completely removing until services migration journal script is in
      `,
      javaFactory: 'return false;'
    },
    {
      name: 'approvableAwareServiceName',
      class: 'String',
      documentation: 'If the DAO is approvable aware, this sets the ApprovableAwareDAO ServiceName field'
    },
    {
      name: 'approvableAwareRelationshipName',
      class: 'String',
      documentation: 'If the DAO is approvable aware, this sets the ApprovableAwareDAO RelationshipName field'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
       if ( of_ == null ) {

        // TODO: replace logger instantiation once javaFactory issue above is fixed
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new foam.nanos.logger.StdoutLogger();
        }
        
        logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);

         if ( logger != null ) {
           logger.error("EasyDAO", getName(), "'of' not set.", new Exception("of not set"));
         } else {
           System.err.println("EasyDAO "+getName()+" 'of' not set.");
         }
         System.exit(1);
       }

       if ( getInnerDAO() == null &&
            getMdao() == null &&
            ! getNullify() ) {
         setMdao(new foam.dao.MDAO(of_));
       }
     `
    },
    {
      name: 'getOuterDAO',
      documentation: 'Method to be overidden on the user end to add framework user specific DAO decorators to EasyDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          type: 'foam.dao.DAO',
          name: 'innerDAO'
        }
      ],
      javaCode: `
        return innerDAO;
      `
    },
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
        this.__context__.lookup(daoType) || global[daoType] :
        daoType;

      if ( ! daoModel ) {
        this.__context__.warn(
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
        if ( this.cache ) {
          if ( this.ttlPurgeTime <= 0 && this.ttlSelectPurgeTime <= 0 ) {
            this.mdao = this.MDAO.create({of: params.of});

            var cache = this.mdao;
            if ( this.dedup ) cache = this.DeDupDAO.create({delegate: cache});
            if ( Array.isArray(this.order) && this.order.length > 0 ) cache = this.OrderedDAO.create({
              delegate: cache,
              comparator: foam.compare.toCompare(this.order)
            });

            // Full cache
            dao = this.CachingDAO.create({
              cache: cache,
              src: dao,
              of: this.model
            });
          }

          // TTL find cache
          if ( this.ttlPurgeTime > 0 )  {
            dao = this.TTLCachingDAO.create({
              delegate: dao,
              purgeTime: this.ttlPurgeTime
            });
          }

          // TTL select cache
          if ( this.ttlSelectPurgeTime > 0 ) {
            dao = this.TTLSelectCachingDAO.create({
              delegate: dao,
              purgeTime: this.ttlSelectPurgeTime
            });
          }
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
        args.startingValue = this.seqStartingValue;
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

      if ( this.contextualize ) {
        dao = this.ContextualizingDAO.create({delegate: dao});
      }

      if ( this.decorators.length ) {
        decoratorsArray = [];
        for ( let i = 0; i < this.decorators.length; i++ ) {
          if ( foam.dao.ProxyDAO.isInstance(this.decorators[i]) ) {
            d = this.decorators[i];
            d.delegate = dao;
            dao = d;
          } else {
            decoratorsArray.push(this.decorators[i]);
          }
        }
        var decorated = this.InterceptedDAO.create({
          decorator: this.CompoundDAODecorator.create({
            decorators: decoratorsArray
          }),
          delegate: dao
        });
        dao = decorated;
      }

      if ( this.order ) {
        for ( var i = 0; i <  this.order.length; i++ ) {
          dao = dao.orderBy(this.order[i]);
        }
      }

      if ( this.timing ) {
        dao = this.TimingDAO.create({ name: this.name + 'DAO', delegate: dao });
      }

      if ( this.logging ) {
        dao = this.LoggingDAO.create({
          nSpec: this.nSpec,
          delegate: dao
        });
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
      type: 'foam.dao.EasyDAO',
      args: [ { javaType: 'foam.core.PropertyInfo...', name: 'props' } ],
      code: function addPropertyIndex() {
        this.mdao && this.mdao.addPropertyIndex.apply(this.mdao, arguments);
        return this;
      },
      javaCode: `
        DAO dao = (DAO) getMdao();
        if ( dao != null &&
             dao instanceof foam.dao.MDAO ) {
          ((foam.dao.MDAO)dao).addIndex(props);
        } else {
          ((Logger) getX().get("logger")).warning(getName(), "Index not added, no access to MDAO");
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
      type: 'foam.dao.EasyDAO',
      documentation: 'Only relavent if the cache is true or if daoType was set to MDAO, but harmless otherwise. Adds an existing index to the MDAO',
      // TODO: The java Index interface conflicts with the js CLASS Index
      args: [ { javaType: 'foam.dao.index.Index', name: 'index' } ],
      code: function addIndex(index) {
        this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
        return this;
      },
      javaCode: `
        DAO dao = (DAO) getMdao();
        if ( dao != null &&
             dao instanceof foam.dao.MDAO ) {
          ((foam.dao.MDAO)dao).addIndex(index);
        } else {
          ((Logger) getX().get("logger")).warning(getName(), "Index not added, no access to MDAO");
        }
        return this;
      `
    },
    {
      name: 'addDecorator',
      documentation: 'Places a decorator chain ending in a null delegate at a specified point in the chain. Automatically insterts between given decorator and mdao. If "before" flag is true, decorator chain placed before the dao instead of inbetween the supplied dao and mdao. Return true on success.',
      type: 'Boolean',
      args: [
        {
          documentation: 'Null ending decorator chain to insert',
          name: 'decorator',
          javaType: 'foam.dao.ProxyDAO'
        },
        {
          documentation: 'Decorator in the EasyDAO chain to place in relation to',
          name: 'location',
          javaType: 'foam.core.ClassInfo'
        },
        {
          documentation: 'If true, decorator chain placed before the dao instead of inbetween the supplied dao and mdao',
          name: 'before',
          class: 'Boolean'
        }
      ],
      javaCode: `
        foam.dao.DAO daodecorator = getDelegate();

        if ( ! ( daodecorator instanceof foam.dao.ProxyDAO ) )
          return false;

        ProxyDAO proxy = (ProxyDAO) daodecorator;
        while ( true ) {
          if ( before && location.isInstance( proxy.getDelegate() ) )
            break;
          else if ( !before && location.isInstance( proxy ) )
            break;
          else if ( !(proxy.getDelegate() instanceof foam.dao.ProxyDAO) )
            return false;

          proxy = (foam.dao.ProxyDAO) proxy.getDelegate();
        }

        if ( decorator == null || ! ( decorator.getDelegate() instanceof ProxyDAO ) )
          return false;

        foam.dao.ProxyDAO decoratorptr = decorator;

        while ( decorator.getDelegate() != null &&
                decorator.getDelegate() instanceof ProxyDAO )
          decorator = (ProxyDAO) decorator.getDelegate();
        decorator.setDelegate(proxy.getDelegate());
        proxy.setDelegate(decoratorptr);
        return true;
      `
    },
    {
      name: 'getDecorators',
      documentation: 'Useful for debugging and checking if EasyDAO is being used to correctly set up a decorator chain',
      type: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        foam.dao.DAO delegate = this;
        while ( delegate != null &&
                delegate instanceof foam.dao.ProxyDAO) {
          sb.append(delegate.getClass().getSimpleName());
          sb.append(":");
          delegate = ((foam.dao.ProxyDAO) delegate).getDelegate();
        }
        return sb.toString();
      `
    },

    // ProxyDAO operations
    {
      name: 'cmd_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'Object',
      code: function cmd_(x, obj) {
        return this.delegate.cmd_(x, obj);
      },
      javaCode: `
      // Used by Medusa to get the real MDAO to update
      if ( foam.dao.DAO.LAST_CMD.equals(obj) ) {
        DAO dao = getLastDao();
        if ( dao != null ) {
          return dao;
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'toString',
      javaCode: `
        var sb = new StringBuilder();
        sb.append("EasyDAO");
        if ( of_ != null ) {
          sb.append("(of: ")
            .append(of_.getId())
            .append(")");
        }
        return sb.toString();
      `
    }
  ]
});
