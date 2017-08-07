foam.CLASS({
  name: 'MidiNote',
  package: 'foam.swift.ui',
  swiftImports: ['AudioToolbox'],
  properties: [
    {
      class: 'Int',
      name: 'channel',
      value: 0,
    },
    {
      class: 'Int',
      name: 'note',
      value: 60,
    },
    {
      class: 'Int',
      name: 'velocity',
      value: 64,
    },
    {
      class: 'Int',
      name: 'releaseVelocity',
      value: 0,
    },
    {
      class: 'Float',
      name: 'duration',
      value: 1,
    },
    {
      swiftType: 'MIDINoteMessage',
      name: 'noteMessage',
      swiftExpressionArgs: [
        'channel',
        'note',
        'velocity',
        'releaseVelocity',
        'duration'
      ],
      swiftExpression: function() {/*
return MIDINoteMessage(
    channel: UInt8(channel),
    note: UInt8(note),
    velocity: UInt8(velocity),
    releaseVelocity: UInt8(releaseVelocity),
    duration: Float32(duration))
      */},
    },
  ],
  actions: [
    {
      name: 'play',
      swiftCode: function() {/*
// Creating the sequence

var sequence: MusicSequence? = nil
_ = NewMusicSequence(&sequence)

// Creating a track

var track: MusicTrack? = nil
_ = MusicSequenceNewTrack(sequence!, &track)

// Adding notes

let time = MusicTimeStamp(0.0)
_ = MusicTrackNewMIDINoteEvent(track!, time, &noteMessage)

// Creating a player

var musicPlayer: MusicPlayer? = nil
_ = NewMusicPlayer(&musicPlayer)

_ = MusicPlayerSetSequence(musicPlayer!, sequence!)
_ = MusicPlayerStart(musicPlayer!)
      */},
    },
  ],
});
