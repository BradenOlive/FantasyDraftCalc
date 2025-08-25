import SwiftUI

@main
struct FantasyDraftCalcApp: App {
    @StateObject private var draftManager = DraftManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(draftManager)
        }
    }
}
