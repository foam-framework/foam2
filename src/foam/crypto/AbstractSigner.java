/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto;

import foam.core.ContextAwareSupport;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.*;

public abstract class AbstractSigner
  extends ContextAwareSupport
  implements Signer
{
  protected String algorithm_;
  protected Provider provider_;

  public AbstractSigner(String algorithm)
    throws NoSuchAlgorithmException
  {
    this(algorithm, new BouncyCastleProvider());
  }

  public AbstractSigner(String algorithm, String provider)
    throws NoSuchAlgorithmException
  {
    this(algorithm, Security.getProvider(provider));
  }

  public AbstractSigner(String algorithm, Provider provider)
    throws NoSuchAlgorithmException
  {
    algorithm_ = algorithm;
    provider_ = provider;
    if ( Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  @Override
  public byte[] sign(byte[] plaintext, PrivateKey privateKey)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    Signature signer = Signature.getInstance(algorithm_, provider_);
    signer.initSign(privateKey);
    signer.update(plaintext);
    return signer.sign();
  }

  @Override
  public boolean verify(byte[] plaintext, byte[] signature, PublicKey publicKey)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    Signature signer = Signature.getInstance(algorithm_, provider_);
    signer.initVerify(publicKey);
    signer.update(plaintext);
    return signer.verify(signature);
  }
}