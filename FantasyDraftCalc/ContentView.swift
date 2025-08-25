import SwiftUI

struct ContentView: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DraftBoardView()
                .tabItem {
                    Image(systemName: "grid")
                    Text("Draft Board")
                }
                .tag(0)
            
            PickSuggestionView()
                .tabItem {
                    Image(systemName: "lightbulb")
                    Text("Suggestions")
                }
                .tag(1)
            
            RosterView()
                .tabItem {
                    Image(systemName: "person.3")
                    Text("My Team")
                }
                .tag(2)
            
            LeagueSettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}

#Preview {
    ContentView()
        .environmentObject(DraftManager())
}
