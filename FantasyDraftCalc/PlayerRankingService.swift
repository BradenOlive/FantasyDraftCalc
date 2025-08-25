import Foundation
import Combine

class PlayerRankingService: ObservableObject {
    private let baseURL = "https://api.fantasypros.com/v1/json/nfl/players"
    private let apiKey = "YOUR_API_KEY" // Replace with actual API key
    
    func loadPlayers() -> AnyPublisher<[Player], Error> {
        // For demo purposes, return mock data
        // In production, this would fetch from API or CSV
        return Just(mockPlayerData)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    func loadPlayersFromCSV() -> AnyPublisher<[Player], Error> {
        guard let url = Bundle.main.url(forResource: "player_rankings", withExtension: "csv") else {
            return Fail(error: PlayerRankingError.fileNotFound)
                .eraseToAnyPublisher()
        }
        
        return Future { promise in
            do {
                let csvString = try String(contentsOf: url)
                let players = self.parseCSV(csvString)
                promise(.success(players))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func loadPlayersFromAPI() -> AnyPublisher<[Player], Error> {
        guard let url = URL(string: baseURL) else {
            return Fail(error: PlayerRankingError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "Authorization")
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: [PlayerAPIResponse].self, decoder: JSONDecoder())
            .map { apiPlayers in
                apiPlayers.map { self.convertAPIPlayerToPlayer($0) }
            }
            .eraseToAnyPublisher()
    }
    
    private func parseCSV(_ csvString: String) -> [Player] {
        let lines = csvString.components(separatedBy: .newlines)
        var players: [Player] = []
        
        for line in lines.dropFirst() { // Skip header
            let columns = line.components(separatedBy: ",")
            guard columns.count >= 8 else { continue }
            
            let name = columns[0].trimmingCharacters(in: .whitespaces)
            let positionString = columns[1].trimmingCharacters(in: .whitespaces)
            let team = columns[2].trimmingCharacters(in: .whitespaces)
            let rank = Int(columns[3]) ?? 999
            let projectedPoints = Double(columns[4]) ?? 0.0
            let adp = Double(columns[5]) ?? 999.0
            let tier = Int(columns[6]) ?? 1
            let byeWeek = Int(columns[7]) ?? 0
            
            guard let position = Position(rawValue: positionString) else { continue }
            
            let player = Player(
                name: name,
                position: position,
                team: team,
                rank: rank,
                projectedPoints: projectedPoints,
                adp: adp,
                tier: tier,
                byeWeek: byeWeek
            )
            
            players.append(player)
        }
        
        return players.sorted { $0.rank < $1.rank }
    }
    
    private func convertAPIPlayerToPlayer(_ apiPlayer: PlayerAPIResponse) -> Player {
        return Player(
            name: apiPlayer.name,
            position: Position(rawValue: apiPlayer.position) ?? .qb,
            team: apiPlayer.team,
            rank: apiPlayer.rank,
            projectedPoints: apiPlayer.projectedPoints,
            adp: apiPlayer.adp,
            tier: apiPlayer.tier,
            byeWeek: apiPlayer.byeWeek
        )
    }
}

// MARK: - Supporting Types

struct PlayerAPIResponse: Codable {
    let name: String
    let position: String
    let team: String
    let rank: Int
    let projectedPoints: Double
    let adp: Double
    let tier: Int
    let byeWeek: Int
}

enum PlayerRankingError: Error {
    case fileNotFound
    case invalidURL
    case parsingError
}

// MARK: - Mock Data

extension PlayerRankingService {
    var mockPlayerData: [Player] {
        return [
            // Top QBs
            Player(name: "Patrick Mahomes", position: .qb, team: "KC", rank: 1, projectedPoints: 420.5, adp: 15.2, tier: 1, byeWeek: 10),
            Player(name: "Josh Allen", position: .qb, team: "BUF", rank: 2, projectedPoints: 410.3, adp: 18.7, tier: 1, byeWeek: 13),
            Player(name: "Jalen Hurts", position: .qb, team: "PHI", rank: 3, projectedPoints: 395.8, adp: 22.1, tier: 1, byeWeek: 10),
            
            // Top RBs
            Player(name: "Christian McCaffrey", position: .rb, team: "SF", rank: 4, projectedPoints: 380.2, adp: 2.3, tier: 1, byeWeek: 9),
            Player(name: "Austin Ekeler", position: .rb, team: "LAC", rank: 5, projectedPoints: 365.7, adp: 8.9, tier: 1, byeWeek: 5),
            Player(name: "Saquon Barkley", position: .rb, team: "NYG", rank: 6, projectedPoints: 350.4, adp: 12.4, tier: 1, byeWeek: 13),
            Player(name: "Derrick Henry", position: .rb, team: "TEN", rank: 7, projectedPoints: 340.1, adp: 14.6, tier: 1, byeWeek: 7),
            Player(name: "Nick Chubb", position: .rb, team: "CLE", rank: 8, projectedPoints: 335.8, adp: 16.2, tier: 1, byeWeek: 5),
            
            // Top WRs
            Player(name: "Justin Jefferson", position: .wr, team: "MIN", rank: 9, projectedPoints: 330.5, adp: 1.1, tier: 1, byeWeek: 13),
            Player(name: "Ja'Marr Chase", position: .wr, team: "CIN", rank: 10, projectedPoints: 325.3, adp: 3.8, tier: 1, byeWeek: 7),
            Player(name: "Tyreek Hill", position: .wr, team: "MIA", rank: 11, projectedPoints: 320.7, adp: 5.2, tier: 1, byeWeek: 10),
            Player(name: "Stefon Diggs", position: .wr, team: "BUF", rank: 12, projectedPoints: 315.4, adp: 7.6, tier: 1, byeWeek: 13),
            Player(name: "Davante Adams", position: .wr, team: "LV", rank: 13, projectedPoints: 310.2, adp: 9.8, tier: 1, byeWeek: 13),
            
            // Top TEs
            Player(name: "Travis Kelce", position: .te, team: "KC", rank: 14, projectedPoints: 305.8, adp: 4.5, tier: 1, byeWeek: 10),
            Player(name: "Mark Andrews", position: .te, team: "BAL", rank: 15, projectedPoints: 280.3, adp: 25.7, tier: 2, byeWeek: 13),
            Player(name: "T.J. Hockenson", position: .te, team: "MIN", rank: 16, projectedPoints: 275.1, adp: 35.2, tier: 2, byeWeek: 13),
            
            // More players for variety
            Player(name: "Bijan Robinson", position: .rb, team: "ATL", rank: 17, projectedPoints: 270.5, adp: 6.8, tier: 2, byeWeek: 11),
            Player(name: "Jonathan Taylor", position: .rb, team: "IND", rank: 18, projectedPoints: 265.3, adp: 11.4, tier: 2, byeWeek: 11),
            Player(name: "A.J. Brown", position: .wr, team: "PHI", rank: 19, projectedPoints: 260.7, adp: 13.2, tier: 2, byeWeek: 10),
            Player(name: "CeeDee Lamb", position: .wr, team: "DAL", rank: 20, projectedPoints: 255.4, adp: 15.9, tier: 2, byeWeek: 7),
            
            // Add more players to reach a reasonable draft pool
            Player(name: "Joe Burrow", position: .qb, team: "CIN", rank: 21, projectedPoints: 250.2, adp: 45.3, tier: 2, byeWeek: 7),
            Player(name: "Lamar Jackson", position: .qb, team: "BAL", rank: 22, projectedPoints: 245.8, adp: 52.1, tier: 2, byeWeek: 13),
            Player(name: "Justin Fields", position: .qb, team: "CHI", rank: 23, projectedPoints: 240.5, adp: 58.7, tier: 3, byeWeek: 13),
            
            // Continue with more players...
            Player(name: "Tony Pollard", position: .rb, team: "DAL", rank: 24, projectedPoints: 235.3, adp: 28.4, tier: 2, byeWeek: 7),
            Player(name: "Rhamondre Stevenson", position: .rb, team: "NE", rank: 25, projectedPoints: 230.1, adp: 32.6, tier: 2, byeWeek: 11),
            Player(name: "Dameon Pierce", position: .rb, team: "HOU", rank: 26, projectedPoints: 225.7, adp: 38.9, tier: 3, byeWeek: 7),
            
            Player(name: "Jaylen Waddle", position: .wr, team: "MIA", rank: 27, projectedPoints: 220.4, adp: 42.1, tier: 2, byeWeek: 10),
            Player(name: "Amon-Ra St. Brown", position: .wr, team: "DET", rank: 28, projectedPoints: 215.2, adp: 48.3, tier: 2, byeWeek: 9),
            Player(name: "DK Metcalf", position: .wr, team: "SEA", rank: 29, projectedPoints: 210.8, adp: 55.7, tier: 3, byeWeek: 5),
            
            Player(name: "George Kittle", position: .te, team: "SF", rank: 30, projectedPoints: 205.5, adp: 65.2, tier: 3, byeWeek: 9),
            Player(name: "Darren Waller", position: .te, team: "NYG", rank: 31, projectedPoints: 200.3, adp: 72.8, tier: 3, byeWeek: 13),
            Player(name: "Evan Engram", position: .te, team: "JAX", rank: 32, projectedPoints: 195.1, adp: 85.4, tier: 4, byeWeek: 9),
        ]
    }
}
