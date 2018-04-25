package foam.nanos.logger;

public class DiscardLogger
  extends ProxyLogger

info(m) {
    if ( ! get.discardInfo() ) {
        getDelegate().info(m);
    }
}