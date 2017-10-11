package com.chrome.origintrials.services;

import com.chrome.origintrials.model.Application;

public interface TokenService {
  public void generateAndEmailToken(Application a);
}
