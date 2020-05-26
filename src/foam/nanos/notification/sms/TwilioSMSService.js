/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.sms',
  name: 'TwilioSMSService',

  implements: [
    'foam.nanos.notification.sms.SMSService'
  ],

  documentation: 'Sends SMS message through Twilio',

  javaImports: [
    'com.twilio.Twilio',
    'com.twilio.rest.api.v2010.account.Message',
    'com.twilio.type.PhoneNumber',
    'foam.dao.DAO',
    'foam.nanos.app.TwilioConfig',
    'foam.nanos.notification.sms.SMSStatus',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'sendSms',
      javaCode: `
        DAO smsMessageDAO = (DAO) x.get("localSmsMessageDAO");
        TwilioConfig twilioConfig = (TwilioConfig) x.get("twilioConfig");
        Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());

        String phoneNumber = "";
        SMSStatus status;

        // check if phone number exists
        if ( ! SafetyUtil.isEmpty(smsMessage.getPhoneNumber()) ) {
          phoneNumber = smsMessage.getPhoneNumber();
        } else {
          status = SMSStatus.UNSENT;
          status.setErrorMessage("Phone number not found, cannot send SMS.");
          smsMessage.setStatus(status);
          return (SMSMessage) smsMessageDAO.put(smsMessage);
        }

        if ( ! SafetyUtil.isEmpty(smsMessage.getMessage()) ) {
          try {
            Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(twilioConfig.getPhoneNumber()),
            smsMessage.getMessage()).create();
            smsMessage.setStatus(SMSStatus.SENT);
            return (SMSMessage) smsMessageDAO.put(smsMessage);
          } catch (Exception e) {
            status = SMSStatus.FAILED;
            status.setErrorMessage(e.toString());
            return (SMSMessage) smsMessageDAO.put(smsMessage);
          }
        } else {
          status = SMSStatus.FAILED;
          status.setErrorMessage("No message found, failed to send SMS.");
          smsMessage.setStatus(status);
          return (SMSMessage) smsMessageDAO.put(smsMessage);
        }
      `
    }
  ]

});
