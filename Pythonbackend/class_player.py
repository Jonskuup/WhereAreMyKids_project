class Player:
    def __init__(self, name, game_id):
        self.name = name
        self.game_id = game_id
        self.monkeys_found = 0

    def set_monkeys(self, amount):
        self.monkeys_found = amount

    def return_json(self):
        return {
            "name": self.name,
            "game_id": self.game_id,
            "monkeys_found": self.monkeys_found
        }