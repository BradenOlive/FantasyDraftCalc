import Foundation

enum Position: String, CaseIterable, Codable {
    case qb = "QB"
    case rb = "RB"
    case wr = "WR"
    case te = "TE"
    case k = "K"
    case dst = "DST"
    
    var displayName: String {
        return self.rawValue
    }
    
    var color: String {
        switch self {
        case .qb: return "blue"
        case .rb: return "green"
        case .wr: return "orange"
        case .te: return "purple"
        case .k: return "gray"
        case .dst: return "red"
        }
    }
}

struct Player: Identifiable, Codable, Equatable {
    let id = UUID()
    let name: String
    let position: Position
    let team: String
    let rank: Int
    let projectedPoints: Double
    let adp: Double // Average Draft Position
    let tier: Int
    let byeWeek: Int
    let isDrafted: Bool
    
    init(name: String, position: Position, team: String, rank: Int, projectedPoints: Double, adp: Double, tier: Int, byeWeek: Int, isDrafted: Bool = false) {
        self.name = name
        self.position = position
        self.team = team
        self.rank = rank
        self.projectedPoints = projectedPoints
        self.adp = adp
        self.tier = tier
        self.byeWeek = byeWeek
        self.isDrafted = isDrafted
    }
    
    static func == (lhs: Player, rhs: Player) -> Bool {
        return lhs.id == rhs.id
    }
}

struct DraftPick: Identifiable, Codable {
    let id = UUID()
    let round: Int
    let pickNumber: Int
    let player: Player?
    let teamName: String
    let timestamp: Date
    
    init(round: Int, pickNumber: Int, player: Player? = nil, teamName: String) {
        self.round = round
        self.pickNumber = pickNumber
        self.player = player
        self.teamName = teamName
        self.timestamp = Date()
    }
}
