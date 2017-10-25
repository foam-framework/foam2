package foam.blob;

public class FileBlob
  extends AbstractBlob
{
  private java.io.File f_;
  private java.nio.channels.FileChannel channel_;

  public FileBlob(java.io.File f) {
    if ( ! f.canRead() ) {
      throw new RuntimeException("Cannot read given file.");
    }

    try {
      f_ = f;
      channel_ = java.nio.channels.FileChannel.open(f_.toPath());
    } catch ( java.io.IOException ex ) {
      throw new RuntimeException(ex);
    }
  }

  @Override
  public Buffer read(Buffer buf, long offset) {
    // TODO
    throw new RuntimeException("Unimplemented");
  }

  @Override
  public long getSize() {
    return f_.length();
  }
}
