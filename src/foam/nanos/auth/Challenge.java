package foam.nanos.auth;

import java.util.Date;

/**
 * Created by marcroopchand on 2017-05-23.
 */
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
