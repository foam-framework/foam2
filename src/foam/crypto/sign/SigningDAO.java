/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import org.bouncycastle.util.encoders.Hex;

import java.security.PrivateKey;

public class SigningDAO
    extends ProxyDAO
{
  protected PrivateKey key_;
  protected String algorithm_;
  protected DAO signatureDAO_;

  // TODO: come up with a better way to set the algorithm and key than this
  public SigningDAO(X x, DAO delegate, String algorithm, PrivateKey key) {
    setX(x);
    setDelegate(delegate);
    key = key;
    algorithm_ = algorithm;
    signatureDAO_ = (DAO) x.get("signatureDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    FObject result = super.put_(x, obj);

    if ( result != null ) {
      // sign result and store in signature dao
      String signature = Hex.toHexString(result.sign(algorithm_, key_));
      SignedFObject signed = new SignedFObject.Builder(x)
          .setData(result)
          .setSignature(signature)
          .build();
      signatureDAO_.put_(x, signed);
    }

    return result;
  }
}