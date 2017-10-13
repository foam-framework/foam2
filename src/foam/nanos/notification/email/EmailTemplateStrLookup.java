/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification.email;

import foam.core.X;
import foam.dao.DAO;
import org.apache.commons.text.StrLookup;

public class EmailTemplateStrLookup
    extends StrLookup
{
  protected X x_;
  protected StrLookup delegate_;

  public EmailTemplateStrLookup(X x, StrLookup delegate) {
    this.x_ = x;
    this.delegate_ = delegate;
  }

  @Override
  public String lookup(String s) {
    if ( s.contains("includes:") ) {
      String key = s.split(":", 2)[1];
      DAO emailTemplateDAO = (DAO) x_.get("emailTemplateDAO");
      EmailTemplate template = (EmailTemplate) emailTemplateDAO.find(key);
      return template.getBody();
    }
    return delegate_.lookup(s);
  }
}