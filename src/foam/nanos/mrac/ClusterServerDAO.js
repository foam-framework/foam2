/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.mrac',
  name: 'ClusterServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Proxy cluster requests through to the ClusterDAO's delegate.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      documentation: `Context name (dao key) of the DAO stack which contains the ClusterDAO from which to extract the delegate to write DOA operations to.`,
      name: 'serviceName',
      class: 'String'
    },
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
       Logger logger = (Logger) getX().get("logger");
       DAO dao = (DAO) getX().get(getServiceName());
       while ( dao != null ) {
         if ( dao instanceof ClusterDAO ) {
           setDelegate(((ClusterDAO) dao).getDelegate());
           break;
         }
         if ( dao instanceof ProxyDAO ) {
           dao = ((ProxyDAO) dao).getDelegate();
         } else {
           break;
         }
       }
       if ( getDelegate() == null ) {
         logger.error("ClusterServerDAO", "init_", "ClusterDAO not found for service", getServiceName());
       } else {
         logger.debug("ClusterServerDAO", "init_", getServiceName());
       }
      `
    },
  ]
});
