package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.dao.DAO;
import org.jtwig.resource.loader.ResourceLoader;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;

public class DAOResourceLoader
    implements ResourceLoader
{
  protected DAO dao_;

  public DAOResourceLoader(DAO dao) {
    this.dao_ = dao;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = (EmailTemplate) dao_.find(s);
    return new ByteArrayInputStream(template.getBodyAsByteArray());
  }

  @Override
  public boolean exists(String s) {
    return ( dao_.find(s) != null );
  }

  @Override
  public Optional<URL> toUrl(String s) {
    return Optional.absent();
  }
}
