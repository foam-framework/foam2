/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import java.util.Date;

public class Challenge {
  protected String challenge_;
  protected Date   ttl_;

  public Challenge(String challenge, Date ttl) {
    challenge_ = challenge;
    ttl_       = ttl;
  }

  public String getChallenge() {
    return challenge_;
  }

  public Date getTtl() {
    return ttl_;
  }
}
