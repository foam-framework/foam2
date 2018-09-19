package foam.lib.parse;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.nio.CharBuffer;

public class ReaderPStream implements PStream {

	protected Reference<StringReader> str;
	protected int pos;
	protected ReaderPStream tail_ = null;

	public ReaderPStream() {
		this(new Reference<StringReader>());
	}

	public ReaderPStream(Reference<StringReader> s) {
		this(s, 0);
	}

	public ReaderPStream(Reference<StringReader> s, int p) {
		this(s, p, null);
	}

	public ReaderPStream(Reference<StringReader> s, int p, Object value) {
		str = s;
		pos = p;
		value_ = value;
	}

	public void setString(StringReader data) {
		str.set(data);
	}

	public char head() {
		try {
			return (char) str.get().read();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return 0;
	}

	public boolean valid() {
		try {
			return str.get().ready();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}

	public PStream tail() {
		if (tail_ == null)
			tail_ = new ReaderPStream(str, pos + 1);
		return tail_;
	}

	private Object value_ = null;

	public Object value() {
		return value_;
	}

	public PStream setValue(Object value) {
		return new ReaderPStream(str, pos, value);
	}

	public String substring(PStream end) {
		ReaderPStream endps = (ReaderPStream) end;

		char[] cbuf = new char[100];
		try {
			str.get().read(cbuf, pos, endps.pos);
			return cbuf.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	public PStream apply(Parser ps, ParserContext x) {
		return ps.parse(this, x);
	}
}
