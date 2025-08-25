import SwiftUI

struct DraftBoardView: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var selectedPosition: Position? = nil
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Draft Status Header
                DraftStatusHeader()
                
                // Filter Bar
                FilterBar(selectedPosition: $selectedPosition, searchText: $searchText)
                
                // Draft Board
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(1...15, id: \.self) { round in
                            DraftRoundView(round: round)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Draft Board")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Reset") {
                        draftManager.resetDraft()
                    }
                    .foregroundColor(.red)
                }
            }
        }
    }
}

struct DraftStatusHeader: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Round \(draftManager.currentRound)")
                        .font(.headline)
                    Text("Pick \(draftManager.currentPick)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Available Players")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(draftManager.availablePlayers.count)")
                        .font(.title2)
                        .fontWeight(.bold)
                }
            }
            
            if draftManager.isUserPick() {
                HStack {
                    Image(systemName: "person.fill")
                        .foregroundColor(.green)
                    Text("Your Pick!")
                        .fontWeight(.semibold)
                        .foregroundColor(.green)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.green.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct FilterBar: View {
    @Binding var selectedPosition: Position?
    @Binding var searchText: String
    
    var body: some View {
        VStack(spacing: 8) {
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search players...", text: $searchText)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(8)
            
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
        }
        .padding(.horizontal)
        .padding(.bottom, 8)
        .background(Color(.systemBackground))
    }
}

struct PositionFilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}

struct DraftRoundView: View {
    @EnvironmentObject var draftManager: DraftManager
    let round: Int
    
    var roundPicks: [DraftPick] {
        draftManager.draftPicks.filter { $0.round == round }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Round \(round)")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
                Text("\(roundPicks.count) picks")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                ForEach(roundPicks) { pick in
                    DraftPickView(pick: pick)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct DraftPickView: View {
    @EnvironmentObject var draftManager: DraftManager
    let pick: DraftPick
    
    var body: some View {
        VStack(spacing: 4) {
            // Pick number and team
            HStack {
                Text("#\(pick.pickNumber)")
                    .font(.caption2)
                    .fontWeight(.bold)
                Spacer()
                Text(pick.teamName)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            // Player info or empty slot
            if let player = pick.player {
                VStack(spacing: 2) {
                    Text(player.name)
                        .font(.caption)
                        .fontWeight(.medium)
                        .lineLimit(1)
                    
                    HStack {
                        Text(player.position.displayName)
                            .font(.caption2)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(positionColor(player.position).opacity(0.2))
                            .foregroundColor(positionColor(player.position))
                            .cornerRadius(4)
                        
                        Text(player.team)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                VStack {
                    Image(systemName: "plus.circle")
                        .font(.title2)
                        .foregroundColor(.secondary)
                    Text("Empty")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .frame(height: 40)
            }
        }
        .padding(8)
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 1, x: 0, y: 1)
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

#Preview {
    DraftBoardView()
        .environmentObject(DraftManager())
}
