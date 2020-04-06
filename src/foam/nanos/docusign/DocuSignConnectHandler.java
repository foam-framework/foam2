package foam.nanos.docusign;

import foam.core.X;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DocuSignConnectHandler implements WebAgent {
  public DocuSignConnectHandler() {}

  @Override
  public void execute (X x) {
    Logger              logger = (Logger) x.get("logger");
    HttpServletRequest  req  = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    logger.error("Unimplemented DocuSignConnectHandler in use.");
    resp.sendError(
      HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
      "This service has not been implemented.");
  }
}