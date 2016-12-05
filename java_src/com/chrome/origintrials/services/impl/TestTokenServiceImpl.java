package com.chrome.origintrials.services.impl;

import com.chrome.origintrials.model.*;

import com.chrome.origintrials.services.TokenService;
import com.google.appengine.api.mail.*;

public class TestTokenServiceImpl implements TokenService {
  public void generateAndEmailToken(Application app) {
    String token = Integer.toHexString((int)(Math.floor((Math.random() * 65535))));

    MailService mail = MailServiceFactory.getMailService();

    try {
      mail.send(new MailService.Message("adamvy@google.com", app.getApplicantEmail(),
                                        "Your token for running " + app.getExperiment() + " on " + app.getOrigin(),
                                        "Hello " + app.getApplicantName() + "\n\n" +
                                        "Your token is: \"" + token + "\""));
    } catch(java.io.IOException e) {
      throw new RuntimeException(e);
    }
  }
}
