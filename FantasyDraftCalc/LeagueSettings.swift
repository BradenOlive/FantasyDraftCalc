import Foundation

enum LeagueType: String, CaseIterable, Codable {
    case standard = "Standard"
    case ppr = "PPR"
    case halfPpr = "Half PPR"
    case superflex = "Superflex"
    case dynasty = "Dynasty"
    
    var displayName: String {
        return self.rawValue
    }
}

struct LeagueSettings: Codable {
    var leagueType: LeagueType
    var numberOfTeams: Int
    var rosterSpots: [Position: Int]
    var scoringSettings: ScoringSettings
    var draftPosition: Int
    var snakeDraft: Bool
    
    init(leagueType: LeagueType = .ppr, numberOfTeams: Int = 12, draftPosition: Int = 1) {
        self.leagueType = leagueType
        self.numberOfTeams = numberOfTeams
        self.draftPosition = draftPosition
        self.snakeDraft = true
        
        // Default roster spots
        self.rosterSpots = [
            .qb: 1,
            .rb: 2,
            .wr: 2,
            .te: 1,
            .k: 1,
            .dst: 1
        ]
        
        // Default scoring settings
        self.scoringSettings = ScoringSettings()
    }
}

struct ScoringSettings: Codable {
    var passingYards: Double = 0.04
    var passingTouchdowns: Double = 4.0
    var interceptions: Double = -2.0
    var rushingYards: Double = 0.1
    var rushingTouchdowns: Double = 6.0
    var receivingYards: Double = 0.1
    var receivingTouchdowns: Double = 6.0
    var receptions: Double = 1.0 // PPR
    var fumblesLost: Double = -2.0
    var fieldGoals: Double = 3.0
    var extraPoints: Double = 1.0
    var sacks: Double = 1.0
    var interceptionsDefense: Double = 2.0
    var fumbleRecoveries: Double = 2.0
    var defensiveTouchdowns: Double = 6.0
    var safety: Double = 2.0
    var pointsAllowed: [Int: Double] = [
        0: 10.0,
        6: 7.0,
        13: 4.0,
        20: 1.0,
        27: 0.0,
        34: -1.0,
        35: -4.0
    ]
}
