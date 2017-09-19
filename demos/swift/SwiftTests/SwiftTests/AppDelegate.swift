//
//  AppDelegate.swift
//  SwiftTests
//
//  Created by Michael Carcasole on 2017-02-22.
//  Copyright © 2017 FOAM. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?


  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    Context.GLOBAL.registerClass(cls: FloatParser.classInfo())
    Context.GLOBAL.registerClass(cls: PropertyParser.classInfo())
    Context.GLOBAL.registerClass(cls: ProxyParser.classInfo())
    Context.GLOBAL.registerClass(cls: NullParser.classInfo())
    Context.GLOBAL.registerClass(cls: MapParser.classInfo())
    Context.GLOBAL.registerClass(cls: LongParser.classInfo())
    Context.GLOBAL.registerClass(cls: IntParser.classInfo())
    Context.GLOBAL.registerClass(cls: FObjectParser.classInfo())
    Context.GLOBAL.registerClass(cls: StringPStream.classInfo())
    Context.GLOBAL.registerClass(cls: FObjectParser_.classInfo())
    Context.GLOBAL.registerClass(cls: Seq1.classInfo())
    Context.GLOBAL.registerClass(cls: Optional.classInfo())
    Context.GLOBAL.registerClass(cls: Literal.classInfo())
    Context.GLOBAL.registerClass(cls: Whitespace.classInfo())
    Context.GLOBAL.registerClass(cls: StringParser.classInfo())
    Context.GLOBAL.registerClass(cls: KeyParser.classInfo())
    Context.GLOBAL.registerClass(cls: FObjectArrayParser.classInfo())
    Context.GLOBAL.registerClass(cls: ExprParser.classInfo())
    Context.GLOBAL.registerClass(cls: DateParser.classInfo())
    Context.GLOBAL.registerClass(cls: BooleanParser.classInfo())
    Context.GLOBAL.registerClass(cls: ArrayParser.classInfo())
    Context.GLOBAL.registerClass(cls: AnyParser.classInfo())
    Context.GLOBAL.registerClass(cls: AnyKeyParser.classInfo())
    Context.GLOBAL.registerClass(cls: Outputter.classInfo())
    Context.GLOBAL.registerClass(cls: Fail.classInfo())
    Context.GLOBAL.registerClass(cls: NotChar.classInfo())
    Context.GLOBAL.registerClass(cls: Chars.classInfo())
    Context.GLOBAL.registerClass(cls: Repeat.classInfo())
    Context.GLOBAL.registerClass(cls: Substring.classInfo())
    Context.GLOBAL.registerClass(cls: Seq2.classInfo())
    Context.GLOBAL.registerClass(cls: Seq0.classInfo())
    Context.GLOBAL.registerClass(cls: Seq.classInfo())
    Context.GLOBAL.registerClass(cls: Repeat0.classInfo())
    Context.GLOBAL.registerClass(cls: NotChars.classInfo())
    Context.GLOBAL.registerClass(cls: AnyChar.classInfo())
    Context.GLOBAL.registerClass(cls: Not.classInfo())
    Context.GLOBAL.registerClass(cls: Alt.classInfo())
    Context.GLOBAL.registerClass(cls: SubSlot.classInfo())
    Context.GLOBAL.registerClass(cls: Slot.classInfo())
    Context.GLOBAL.registerClass(cls: PropertySlot.classInfo())
    Context.GLOBAL.registerClass(cls: ExpressionSlot.classInfo())
    Context.GLOBAL.registerClass(cls: ConstantSlot.classInfo())
    Context.GLOBAL.registerClass(cls: Message.classInfo())
    Context.GLOBAL.registerClass(cls: RPCMessage.classInfo())
    Context.GLOBAL.registerClass(cls: RPCReturnBox.classInfo())
    Context.GLOBAL.registerClass(cls: RPCReturnMessage.classInfo())
    Context.GLOBAL.registerClass(cls: ClientBoxRegistry.classInfo())
    Context.GLOBAL.registerClass(cls: ReplyBox.classInfo())
    Context.GLOBAL.registerClass(cls: ProxyBox.classInfo())
    Context.GLOBAL.registerClass(cls: RPCErrorMessage.classInfo())
    Context.GLOBAL.registerClass(cls: BoxRegistry.classInfo())
    Context.GLOBAL.registerClass(cls: SubBox.classInfo())
    Context.GLOBAL.registerClass(cls: SubBoxMessage.classInfo())
    Context.GLOBAL.registerClass(cls: NoSuchNameException.classInfo())
    Context.GLOBAL.registerClass(cls: BoxService.classInfo())
    Context.GLOBAL.registerClass(cls: HTTPBox.classInfo())
    Context.GLOBAL.registerClass(cls: HTTPBoxOutputter.classInfo())
    Context.GLOBAL.registerClass(cls: HTTPReplyBox.classInfo())
    Context.GLOBAL.registerClass(cls: BoxContext.classInfo())
    Context.GLOBAL.registerClass(cls: LoggedLookupContext.classInfo())
    Context.GLOBAL.registerClass(cls: ClassWhitelistContext.classInfo())
    Context.GLOBAL.registerClass(cls: NamedBox.classInfo())
    Context.GLOBAL.registerClass(cls: LookupBox.classInfo())
    Context.GLOBAL.registerClass(cls: BoxRegistryBox.classInfo())
    Context.GLOBAL.registerClass(cls: SkeletonBox.classInfo())
    Context.GLOBAL.registerClass(cls: InvalidMessageException.classInfo())
    Context.GLOBAL.registerClass(cls: HelloMessage.classInfo())
    Context.GLOBAL.registerClass(cls: ArraySink.classInfo())
    Context.GLOBAL.registerClass(cls: ArrayDAO.classInfo())
    Context.GLOBAL.registerClass(cls: AbstractDAO.classInfo())
    Context.GLOBAL.registerClass(cls: SkipSink.classInfo())
    Context.GLOBAL.registerClass(cls: ProxySink.classInfo())
    Context.GLOBAL.registerClass(cls: PredicatedSink.classInfo())
    Context.GLOBAL.registerClass(cls: OrderedSink.classInfo())
    Context.GLOBAL.registerClass(cls: LimitedSink.classInfo())
    Context.GLOBAL.registerClass(cls: ResetListener.classInfo())
    Context.GLOBAL.registerClass(cls: TabataSoundView.classInfo())
    Context.GLOBAL.registerClass(cls: MidiNote.classInfo())
    Context.GLOBAL.registerClass(cls: TestExtended.classInfo())
    Context.GLOBAL.registerClass(cls: Test.classInfo())
    Context.GLOBAL.registerClass(cls: RequiredClass.classInfo())
    Context.GLOBAL.registerClass(cls: Tabata.classInfo())
    Context.GLOBAL.registerClass(cls: FoamTimer.classInfo())
    Context.GLOBAL.registerClass(cls: ScrollingViewController.classInfo())
    Context.GLOBAL.registerClass(cls: FOAMUITextFieldInt.classInfo())
    Context.GLOBAL.registerClass(cls: FOAMUITextField.classInfo())
    Context.GLOBAL.registerClass(cls: FOAMUILabel.classInfo())
    Context.GLOBAL.registerClass(cls: DetailView.classInfo())
    Context.GLOBAL.registerClass(cls: FOAMActionUIButton.classInfo())
    
    let app = SwiftApp()
    app.startListeners()

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
    //window?.rootViewController = app.navVc
    window?.rootViewController = UIViewController()
    window?.makeKeyAndVisible()

    return true
  }
}
