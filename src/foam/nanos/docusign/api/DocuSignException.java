package foam.nanos.docusign;

public class DocuSignException extends Exception {
  public int status;

  public DocuSignException(int status, String message) {
    super(message);
    this.status = status;
  }
}