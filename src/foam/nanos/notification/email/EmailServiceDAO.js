/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'emailService',
      documentation: `This property determines how to process the email.`,
      of: 'foam.nanos.notification.email.EmailService',
      class: 'FObjectProperty'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
      `
        getEmailService().sendEmail(x, (foam.nanos.notification.email.EmailMessage)obj);
        return getDelegate().inX(x).put(obj);
      `
    }
  ]
});

