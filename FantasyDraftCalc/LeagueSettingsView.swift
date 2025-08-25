import SwiftUI

struct LeagueSettingsView: View {
    @EnvironmentObject var draftManager: DraftManager
    @State private var showingResetAlert = false
    
    var body: some View {
        NavigationView {
            Form {
                // League Type Section
                Section("League Type") {
                    Picker("League Type", selection: $draftManager.leagueSettings.leagueType) {
                        ForEach(LeagueType.allCases, id: \.self) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                // Draft Settings Section
                Section("Draft Settings") {
                    Stepper("Number of Teams: \(draftManager.leagueSettings.numberOfTeams)", 
                           value: $draftManager.leagueSettings.numberOfTeams, in: 8...16)
                    
                    Stepper("Draft Position: \(draftManager.leagueSettings.draftPosition)", 
                           value: $draftManager.leagueSettings.draftPosition, in: 1...draftManager.leagueSettings.numberOfTeams)
                    
                    Toggle("Snake Draft", isOn: $draftManager.leagueSettings.snakeDraft)
                }
                
                // Roster Requirements Section
                Section("Roster Requirements") {
                    ForEach(Position.allCases, id: \.self) { position in
                        HStack {
                            Text(position.displayName)
                            Spacer()
                            Stepper("\(draftManager.leagueSettings.rosterSpots[position] ?? 0)", 
                                   value: Binding(
                                    get: { draftManager.leagueSettings.rosterSpots[position] ?? 0 },
                                    set: { draftManager.leagueSettings.rosterSpots[position] = $0 }
                                   ), in: 0...5)
                        }
                    }
                }
                
                // Scoring Settings Section
                Section("Scoring Settings") {
                    ScoringSettingsView()
                }
                
                // Data Source Section
                Section("Data Source") {
                    DataSourceView()
                }
                
                // Actions Section
                Section {
                    Button("Reset Draft") {
                        showingResetAlert = true
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("League Settings")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Reset Draft", isPresented: $showingResetAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Reset", role: .destructive) {
                    draftManager.resetDraft()
                }
            } message: {
                Text("This will clear all drafted players and reset the draft board. This action cannot be undone.")
            }
        }
    }
}

struct ScoringSettingsView: View {
    @EnvironmentObject var draftManager: DraftManager
    
    var body: some View {
        VStack(spacing: 12) {
            // Passing
            GroupBox("Passing") {
                VStack(spacing: 8) {
                    ScoringRow(title: "Passing Yards", value: $draftManager.leagueSettings.scoringSettings.passingYards, format: "%.2f")
                    ScoringRow(title: "Passing TDs", value: $draftManager.leagueSettings.scoringSettings.passingTouchdowns, format: "%.1f")
                    ScoringRow(title: "Interceptions", value: $draftManager.leagueSettings.scoringSettings.interceptions, format: "%.1f")
                }
            }
            
            // Rushing
            GroupBox("Rushing") {
                VStack(spacing: 8) {
                    ScoringRow(title: "Rushing Yards", value: $draftManager.leagueSettings.scoringSettings.rushingYards, format: "%.2f")
                    ScoringRow(title: "Rushing TDs", value: $draftManager.leagueSettings.scoringSettings.rushingTouchdowns, format: "%.1f")
                }
            }
            
            // Receiving
            GroupBox("Receiving") {
                VStack(spacing: 8) {
                    ScoringRow(title: "Receiving Yards", value: $draftManager.leagueSettings.scoringSettings.receivingYards, format: "%.2f")
                    ScoringRow(title: "Receiving TDs", value: $draftManager.leagueSettings.scoringSettings.receivingTouchdowns, format: "%.1f")
                    ScoringRow(title: "Receptions", value: $draftManager.leagueSettings.scoringSettings.receptions, format: "%.1f")
                }
            }
            
            // Kicking
            GroupBox("Kicking") {
                VStack(spacing: 8) {
                    ScoringRow(title: "Field Goals", value: $draftManager.leagueSettings.scoringSettings.fieldGoals, format: "%.1f")
                    ScoringRow(title: "Extra Points", value: $draftManager.leagueSettings.scoringSettings.extraPoints, format: "%.1f")
                }
            }
            
            // Defense
            GroupBox("Defense") {
                VStack(spacing: 8) {
                    ScoringRow(title: "Sacks", value: $draftManager.leagueSettings.scoringSettings.sacks, format: "%.1f")
                    ScoringRow(title: "Interceptions", value: $draftManager.leagueSettings.scoringSettings.interceptionsDefense, format: "%.1f")
                    ScoringRow(title: "Fumble Recoveries", value: $draftManager.leagueSettings.scoringSettings.fumbleRecoveries, format: "%.1f")
                    ScoringRow(title: "Defensive TDs", value: $draftManager.leagueSettings.scoringSettings.defensiveTouchdowns, format: "%.1f")
                    ScoringRow(title: "Safety", value: $draftManager.leagueSettings.scoringSettings.safety, format: "%.1f")
                }
            }
        }
    }
}

struct ScoringRow: View {
    let title: String
    @Binding var value: Double
    let format: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            TextField("Value", value: $value, format: .number)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .frame(width: 80)
        }
    }
}

struct DataSourceView: View {
    @State private var selectedDataSource = "Mock Data"
    @State private var apiKey = ""
    @State private var showingAPIKeyAlert = false
    
    let dataSources = ["Mock Data", "CSV File", "FantasyPros API"]
    
    var body: some View {
        VStack(spacing: 12) {
            Picker("Data Source", selection: $selectedDataSource) {
                ForEach(dataSources, id: \.self) { source in
                    Text(source).tag(source)
                }
            }
            .pickerStyle(SegmentedPickerStyle())
            
            if selectedDataSource == "FantasyPros API" {
                VStack(alignment: .leading, spacing: 8) {
                    Text("API Key")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    SecureField("Enter your API key", text: $apiKey)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button("Get API Key") {
                        showingAPIKeyAlert = true
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                }
            }
            
            if selectedDataSource == "CSV File" {
                VStack(alignment: .leading, spacing: 8) {
                    Text("CSV Format")
                        .font(.caption)
                        .fontWeight(.semibold)
                    
                    Text("Name,Position,Team,Rank,ProjectedPoints,ADP,Tier,ByeWeek")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color(.systemGray6))
                        .cornerRadius(4)
                }
            }
        }
        .alert("API Key Required", isPresented: $showingAPIKeyAlert) {
            Button("OK") { }
        } message: {
            Text("To use FantasyPros API, you'll need to sign up for an API key at fantasypros.com")
        }
    }
}

#Preview {
    LeagueSettingsView()
        .environmentObject(DraftManager())
}
