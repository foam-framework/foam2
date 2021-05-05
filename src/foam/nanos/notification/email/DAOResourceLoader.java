/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.nanos.auth.Group;
import foam.nanos.notification.email.EmailTemplate;
import foam.util.SafetyUtil;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.List;

import static foam.mlang.MLang.*;

public class DAOResourceLoader
  extends    ContextAwareSupport
  implements ResourceLoader
{
  protected String groupId_;
  protected String locale_;

  public static EmailTemplate findTemplate(X x, String name, String groupId, String locale) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");

    /*
    TODO:

    name  group locale spid
      Y     Y     Y     Y
      Y     Y     Y     *
      Y     Y     *     Y
      Y     Y     *     *
      Y     *     *     Y
      Y     *     *     *
    */

    do {
      EmailTemplate emailTemplate = (EmailTemplate) emailTemplateDAO
        .find(
          AND(
            EQ(EmailTemplate.NAME,   name),
            EQ(EmailTemplate.GROUP,  SafetyUtil.isEmpty(groupId) ? "*" : groupId),
            EQ(EmailTemplate.LOCALE, locale)
          ));

      if ( emailTemplate == null ) {
        emailTemplate = (EmailTemplate) emailTemplateDAO
          .find(
            AND(
              EQ(EmailTemplate.NAME,  name),
              EQ(EmailTemplate.GROUP, SafetyUtil.isEmpty(groupId) ? "*" : groupId)
            ));
      }

      if ( emailTemplate == null && ! SafetyUtil.isEmpty(groupId) ) {
        emailTemplate = (EmailTemplate) emailTemplateDAO
          .find(
            AND(
              EQ(EmailTemplate.NAME,  name),
              EQ(EmailTemplate.GROUP, "*")
            ));
      }

      if ( emailTemplate != null ) return emailTemplate;

      // exit condition, no emails even with wildcard group so return null
      if ( "*".equals(groupId) ) return null;

      Group group = (Group) groupDAO.find(groupId);
      groupId = ( group != null && ! SafetyUtil.isEmpty(group.getParent()) ) ? group.getParent() : "*";
    } while ( ! SafetyUtil.isEmpty(groupId) );

    return null;
  }

  public DAOResourceLoader(X x, String groupId, String locale) {
    setX(x);
    this.groupId_ = groupId;
    this.locale_  = locale;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = DAOResourceLoader.findTemplate(getX(), s, this.groupId_, this.locale_);
    return template == null ? null : new ByteArrayInputStream(template.getBodyAsByteArray());
  }

  @Override
  public boolean exists(String s) {
    return load(s) != null;
  }

  @Override
  public Optional<URL> toUrl(String s) {
    return Optional.absent();
  }
}
