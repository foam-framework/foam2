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
    'com.twilio.rest.api.v2010.account.Message',
    'com.twilio.Twilio',
    'com.twilio.type.PhoneNumber',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.sms.SMSStatus',
    'foam.nanos.notification.sms.TwilioConfig',
    'foam.nanos.om.OMLogger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        OMLogger omLogger = (OMLogger) x.get("OMLogger");
        TwilioConfig twilioConfig = (TwilioConfig) x.get("twilioConfig");
        String phoneNumber = "";
        SMSStatus status;

        // check if twilio credentials are set
        if ( SafetyUtil.isEmpty(twilioConfig.getAccountSid()) || 
             SafetyUtil.isEmpty(twilioConfig.getAuthToken()) ) {
               logger.error("Twilio accountSid or authToken were not found. Message was not sent.");
               smsMessage.setStatus(SMSStatus.UNSENT);
               return smsMessage;
        }

        Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());

        // check if phone number exists
        if ( ! SafetyUtil.isEmpty(smsMessage.getPhoneNumber()) ) {
          phoneNumber = smsMessage.getPhoneNumber();
        } else {
          status = SMSStatus.FAILED;
          status.setErrorMessage("Phone number not found, failed to send SMS.");
          smsMessage.setStatus(status);
          return smsMessage;
        }

        // check if message exists
        if ( ! SafetyUtil.isEmpty(smsMessage.getMessage()) ) {
          try {
            omLogger.log(this.getClass().getSimpleName(), "message", "sending");
            Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(twilioConfig.getPhoneNumber()),
            smsMessage.getMessage()).create();
            smsMessage.setStatus(SMSStatus.SENT);
            omLogger.log(this.getClass().getSimpleName(), "message", "sent");
            return smsMessage;
          } catch (Exception e) {
            status = SMSStatus.FAILED;
            status.setErrorMessage(e.toString());
            return smsMessage;
          }
        } else {
          status = SMSStatus.FAILED;
          status.setErrorMessage("No message found, failed to send SMS.");
          smsMessage.setStatus(status);
          return smsMessage;
        }
      `
    }
  ]

});
