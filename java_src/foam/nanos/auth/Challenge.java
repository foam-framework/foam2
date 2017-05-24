package foam.nanos.auth;

import java.util.Date;

/**
 * Created by marcroopchand on 2017-05-23.
 */
public class Challenge {
	private String challenge;
	private Date ttl;

	public Challenge(String challenge, Date ttl) {
		this.challenge = challenge;
		this.ttl = ttl;
	}

	public String getChallenge() {
		return challenge;
	}

	public Date getTtl() {
		return ttl;
	}
}