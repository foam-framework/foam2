/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.swift.net',
  name: 'Socket',

  requires: [
    'foam.swift.parse.json.output.Outputter',
    'foam.box.RegisterSelfMessage',
  ],

  swiftImplements: [
    'StreamDelegate',
  ],

  topics: [
    'connect',
    'message',
    'errorEvent',
    'disconnect',
  ],

  imports: [
    'me',
  ],

  properties: [
    {
      swiftType: 'InputStream?',
      name: 'inputStream',
      swiftPostSet: `
if let oldValue = oldValue as? InputStream {
  oldValue.close()
  _ = self.disconnect.pub()
}
newValue?.delegate = self
DispatchQueue.main.async {
  newValue?.schedule(in: RunLoop.current, forMode: .defaultRunLoopMode)
  newValue?.open()
}
      `,
    },
    {
      swiftType: 'OutputStream?',
      name: 'outputStream',
      swiftPostSet: `
if let oldValue = oldValue as? OutputStream {
  oldValue.close()
  _ = self.disconnect.pub()
}
newValue?.delegate = self
DispatchQueue.main.async {
  newValue?.schedule(in: RunLoop.current, forMode: .defaultRunLoopMode)
  newValue?.open()
}
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.json.output.Outputter',
      name: 'outputter',
      required: true,
      swiftFactory: 'return Outputter_create()',
    },
  ],

  methods: [
    {
      name: 'init',
      swiftCode: `
onDetach(Subscription(detach: { [weak self] in
  _ = self?.disconnect.pub()
  self?.outputStream?.close()
  self?.inputStream?.close()
}))
      `,
    },
    {
      name: 'write',
      args: [
        {
          type: 'String',
          name: 'str',
        },
      ],
      swiftCode: `
var size = Int32(str.count)
var buffer = Data(buffer: UnsafeBufferPointer(start: &size, count: 1))
buffer.append(str, count: str.count)
_ = buffer.withUnsafeBytes { outputStream?.write($0, maxLength: 4 + str.count) }
      `,
    },
    {
      name: 'connectTo',
      args: [
        {
          name: 'url',
          type: 'String',
        },
      ],
      swiftCode: `
let urlTokens = url.split(separator: ":")
let host = urlTokens[0]
let port = urlTokens[1]

var readStream: Unmanaged<CFReadStream>?
var writeStream: Unmanaged<CFWriteStream>?

CFStreamCreatePairWithSocketToHost(
  nil, host as CFString, UInt32(port)!, &readStream, &writeStream)

set(key: "inputStream", value: readStream?.takeRetainedValue())
set(key: "outputStream", value: writeStream?.takeRetainedValue())
      `,
    },
  ],

  swiftCode: `
public func stream(_ aStream: Stream, handle eventCode: Stream.Event) {

  if eventCode == .errorOccurred {
    _ = errorEvent.pub()
  }

  if eventCode.contains(.openCompleted) && aStream == outputStream {
    DispatchQueue.global(qos: .background).async {
      let str = self.outputter.swiftStringify(self.RegisterSelfMessage_create([
        "name": (self.me as! NamedBox).name
      ]))
      self.write(str)
      _ = self.connect.pub()
    }
  }

  if eventCode.contains(.hasBytesAvailable) && aStream == inputStream {
    let sizeBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: 4)
    if inputStream!.read(sizeBuffer, maxLength: 4) != 4 {
      fatalError("Not enough bytes to read for size")
    }
    let size = Int(UnsafeMutableRawPointer(sizeBuffer).load(as: Int32.self))

    let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: size)
    let read = inputStream!.read(buffer, maxLength: size)
    var data = Data()
    data.append(buffer, count: read)
    let str = String(data: data, encoding: .utf8)!
    _ = message.pub([str])
  }
}
  `,
});
