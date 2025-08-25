import SwiftUI

struct RosterView: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var selectedPosition: Position? = nil
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // Team Summary
                    TeamSummaryCard()
                    
                    // Roster by Position
                    RosterByPosition()
                    
                    // Draft History
                    DraftHistorySection()
                }
                .padding()
            }
            .navigationTitle("My Team")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct TeamSummaryCard: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var totalProjectedPoints: Double {
        draftManager.userTeam.reduce(0) { $0 + $1.projectedPoints }
    }
    
    var averageTier: Double {
        guard !draftManager.userTeam.isEmpty else { return 0 }
        let totalTier = draftManager.userTeam.reduce(0) { $0 + $1.tier }
        return Double(totalTier) / Double(draftManager.userTeam.count)
    }
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Team Summary")
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text("\(draftManager.userTeam.count) players drafted")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 16) {
                StatCard(title: "Total Points", value: "\(Int(totalProjectedPoints))")
                StatCard(title: "Avg Tier", value: String(format: "%.1f", averageTier))
                StatCard(title: "Players", value: "\(draftManager.userTeam.count)")
            }
            
            // Position Distribution
            PositionDistributionChart()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct PositionDistributionChart: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var positionCounts: [Position: Int] {
        Dictionary(grouping: draftManager.userTeam, by: { $0.position })
            .mapValues { $0.count }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Position Distribution")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                ForEach(Position.allCases, id: \.self) { position in
                    PositionCountView(
                        position: position,
                        count: positionCounts[position] ?? 0
                    )
                }
            }
        }
    }
}

struct PositionCountView: View {
    let position: Position
    let count: Int
    
    var body: some View {
        VStack(spacing: 4) {
            Text(position.displayName)
                .font(.caption2)
                .fontWeight(.medium)
            
            Text("\(count)")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(positionColor(position))
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(positionColor(position).opacity(0.1))
        .cornerRadius(8)
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

struct RosterByPosition: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var selectedPosition: Position? = nil
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Roster by Position")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
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
            }
            
            // Players List
            LazyVStack(spacing: 8) {
                ForEach(filteredPlayers) { player in
                    RosterPlayerCard(player: player)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var filteredPlayers: [Player] {
        if let position = selectedPosition {
            return draftManager.userTeam.filter { $0.position == position }
        } else {
            return draftManager.userTeam.sorted { $0.rank < $1.rank }
        }
    }
}

struct RosterPlayerCard: View {
    let player: Player
    
    var body: some View {
        HStack(spacing: 12) {
            // Position Badge
            VStack {
                Text(player.position.displayName)
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(positionColor(player.position).opacity(0.2))
                    .foregroundColor(positionColor(player.position))
                    .cornerRadius(6)
            }
            
            // Player Info
            VStack(alignment: .leading, spacing: 2) {
                Text(player.name)
                    .font(.headline)
                    .fontWeight(.medium)
                
                HStack {
                    Text(player.team)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Tier \(player.tier)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Bye \(player.byeWeek)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Stats
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(Int(player.projectedPoints))")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text("Rank #\(player.rank)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
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

struct DraftHistorySection: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var userPicks: [DraftPick] {
        draftManager.draftPicks.filter { pick in
            pick.player != nil && draftManager.userTeam.contains(pick.player!)
        }.sorted { $0.pickNumber < $1.pickNumber }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Draft History")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if userPicks.isEmpty {
                Text("No players drafted yet")
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(userPicks) { pick in
                        DraftHistoryCard(pick: pick)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct DraftHistoryCard: View {
    let pick: DraftPick
    
    var body: some View {
        HStack(spacing: 12) {
            // Pick Info
            VStack(alignment: .leading, spacing: 2) {
                Text("Round \(pick.round), Pick \(pick.pickNumber)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                if let player = pick.player {
                    Text(player.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
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
                    }
                }
            }
            
            Spacer()
            
            // Player Stats
            if let player = pick.player {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(Int(player.projectedPoints)) pts")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    
                    Text("ADP: \(String(format: "%.1f", player.adp))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
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

struct StatCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    RosterView()
        .environmentObject(DraftManager())
}
