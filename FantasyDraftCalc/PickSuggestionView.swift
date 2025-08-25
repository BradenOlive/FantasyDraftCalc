import SwiftUI

struct PickSuggestionView: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var selectedPosition: Position? = nil
    @State private var showingPlayerDetail = false
    @State private var selectedPlayer: Player?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Current Pick Info
                CurrentPickInfo()
                
                // Optimal Pick Suggestion
                OptimalPickSection()
                
                // Available Players List
                AvailablePlayersList(
                    selectedPosition: $selectedPosition,
                    showingPlayerDetail: $showingPlayerDetail,
                    selectedPlayer: $selectedPlayer
                )
            }
            .navigationTitle("Pick Suggestions")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingPlayerDetail) {
                if let player = selectedPlayer {
                    PlayerDetailView(player: player)
                }
            }
        }
    }
}

struct CurrentPickInfo: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Current Pick")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("Round \(draftManager.currentRound), Pick \(draftManager.currentPick)")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                if draftManager.isUserPick() {
                    VStack(alignment: .trailing) {
                        Text("Your Turn!")
                            .font(.caption)
                            .foregroundColor(.green)
                        Image(systemName: "person.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    }
                } else {
                    VStack(alignment: .trailing) {
                        Text("Waiting...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Image(systemName: "clock")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Team needs summary
            TeamNeedsSummary()
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct TeamNeedsSummary: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Team Needs")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                ForEach(Position.allCases, id: \.self) { position in
                    PositionNeedView(position: position)
                }
            }
        }
    }
}

struct PositionNeedView: View {
    @EnvironmentObject var draftManager: DraftManager
    let position: Position
    
    var currentCount: Int {
        draftManager.userTeam.filter { $0.position == position }.count
    }
    
    var requiredCount: Int {
        draftManager.leagueSettings.rosterSpots[position] ?? 0
    }
    
    var needLevel: NeedLevel {
        if currentCount >= requiredCount {
            return .filled
        } else if currentCount == 0 {
            return .critical
        } else {
            return .moderate
        }
    }
    
    var body: some View {
        VStack(spacing: 4) {
            Text(position.displayName)
                .font(.caption2)
                .fontWeight(.medium)
            
            Text("\(currentCount)/\(requiredCount)")
                .font(.caption2)
                .foregroundColor(needLevel.color)
            
            Circle()
                .fill(needLevel.color)
                .frame(width: 8, height: 8)
        }
        .padding(.vertical, 4)
        .padding(.horizontal, 8)
        .background(needLevel.color.opacity(0.1))
        .cornerRadius(6)
    }
}

enum NeedLevel {
    case critical, moderate, filled
    
    var color: Color {
        switch self {
        case .critical: return .red
        case .moderate: return .orange
        case .filled: return .green
        }
    }
}

struct OptimalPickSection: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var showingPlayerDetail = false
    
    var optimalPlayer: Player? {
        draftManager.getOptimalPick()
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.yellow)
                Text("Optimal Pick")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if let player = optimalPlayer {
                OptimalPlayerCard(player: player)
                    .onTapGesture {
                        showingPlayerDetail = true
                    }
            } else {
                Text("No optimal pick available")
                    .foregroundColor(.secondary)
                    .padding()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        .sheet(isPresented: $showingPlayerDetail) {
            if let player = optimalPlayer {
                PlayerDetailView(player: player)
            }
        }
    }
}

struct OptimalPlayerCard: View {
    @EnvironmentObject var draftManager: DraftManager
    let player: Player
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(player.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        Text(player.position.displayName)
                            .font(.caption)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(positionColor(player.position).opacity(0.2))
                            .foregroundColor(positionColor(player.position))
                            .cornerRadius(4)
                        
                        Text(player.team)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("\(Int(player.projectedPoints)) pts")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    
                    Text("ADP: \(String(format: "%.1f", player.adp))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Button("Draft Player") {
                    draftManager.makePick(player: player)
                }
                .buttonStyle(.borderedProminent)
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Tier \(player.tier)")
                        .font(.caption)
                        .fontWeight(.medium)
                    Text("Rank #\(player.rank)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func positionColor(_ position: Position) -> Color {
        switch position {
        case .qb: return .blue
        case .rb: return .green
        case .wr: return .orange
        case .te: return .purple
        case .k: return .gray
        case .dst: return .red
        }
    }
}

struct AvailablePlayersList: View {
    @EnvironmentObject var draftManager: DraftManager
    @Binding var selectedPosition: Position?
    @Binding var showingPlayerDetail: Bool
    @Binding var selectedPlayer: Player?
    @State private var searchText = ""
    
    var filteredPlayers: [Player] {
        var players = draftManager.availablePlayers
        
        if let position = selectedPosition {
            players = players.filter { $0.position == position }
        }
        
        if !searchText.isEmpty {
            players = players.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        
        return players.sorted { $0.rank < $1.rank }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Search and Filter
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search players...", text: $searchText)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .padding(.horizontal)
            .padding(.bottom, 8)
            
            // Position Filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    PositionFilterButton(title: "All", isSelected: selectedPosition == nil) {
                        selectedPosition = nil
                    }
                    
                    ForEach(Position.allCases, id: \.self) { position in
                        PositionFilterButton(
                            title: position.displayName,
                            isSelected: selectedPosition == position
                        ) {
                            selectedPosition = selectedPosition == position ? nil : position
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.bottom, 8)
            
            // Players List
            List(filteredPlayers) { player in
                PlayerRowView(player: player) {
                    selectedPlayer = player
                    showingPlayerDetail = true
                }
            }
            .listStyle(PlainListStyle())
        }
    }
}

struct PlayerRowView: View {
    @EnvironmentObject var draftManager: DraftManager
    let player: Player
    let onTap: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Rank
            Text("#\(player.rank)")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.secondary)
                .frame(width: 30)
            
            // Player Info
            VStack(alignment: .leading, spacing: 2) {
                Text(player.name)
                    .font(.headline)
                    .fontWeight(.medium)
                
                HStack {
                    Text(player.position.displayName)
                        .font(.caption)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(positionColor(player.position).opacity(0.2))
                        .foregroundColor(positionColor(player.position))
                        .cornerRadius(4)
                    
                    Text(player.team)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Tier \(player.tier)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Stats
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(Int(player.projectedPoints))")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.blue)
                
                Text("ADP: \(String(format: "%.1f", player.adp))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
    
    private func positionColor(_ position: Position) -> Color {
        switch position {
        case .qb: return .blue
        case .rb: return .green
        case .wr: return .orange
        case .te: return .purple
        case .k: return .gray
        case .dst: return .red
        }
    }
}

struct PlayerDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var draftManager: DraftManager
    let player: Player
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Player Header
                    PlayerHeaderView(player: player)
                    
                    // Stats Grid
                    PlayerStatsGrid(player: player)
                    
                    // Draft Button
                    if draftManager.isUserPick() {
                        Button("Draft \(player.name)") {
                            draftManager.makePick(player: player)
                            dismiss()
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                    }
                }
                .padding()
            }
            .navigationTitle("Player Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct PlayerHeaderView: View {
    let player: Player
    
    var body: some View {
        VStack(spacing: 12) {
            Text(player.name)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            HStack(spacing: 16) {
                VStack {
                    Text(player.position.displayName)
                        .font(.headline)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(positionColor(player.position).opacity(0.2))
                        .foregroundColor(positionColor(player.position))
                        .cornerRadius(8)
                }
                
                VStack {
                    Text(player.team)
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
            }
            
            Text("Rank #\(player.rank) • Tier \(player.tier)")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private func positionColor(_ position: Position) -> Color {
        switch position {
        case .qb: return .blue
        case .rb: return .green
        case .wr: return .orange
        case .te: return .purple
        case .k: return .gray
        case .dst: return .red
        }
    }
}

struct PlayerStatsGrid: View {
    let player: Player
    
    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
            StatCard(title: "Projected Points", value: "\(Int(player.projectedPoints))")
            StatCard(title: "ADP", value: String(format: "%.1f", player.adp))
            StatCard(title: "Tier", value: "\(player.tier)")
            StatCard(title: "Bye Week", value: "\(player.byeWeek)")
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

#Preview {
    PickSuggestionView()
        .environmentObject(DraftManager())
}
