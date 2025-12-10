from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from class_player import Player
from game_functions import (
    get_country_iso,
    get_eu_countries,
    add_player,
    does_player_exist,
    get_game_id,
    assign_monkey_countries,
    monkeys_found_count,
    check_country,
    mark_country_visited,
    help_command,
    get_visited_countries
)

# Oma api avain api-ninjas.com sivulta
api_key = "oma api avain"

app = Flask(__name__)
CORS(app)

# Haetaan lippu API:n url
@app.route("/flag/<country>")
def flag(country):
    iso = get_country_iso(country)
    url = f"https://api.api-ninjas.com/v1/countryflag?country={iso}"
    response = requests.get(url, headers={"X-Api-Key": api_key})
    return jsonify({"flag": response.json().get("rectangle_image_url")})

# Luodaan uusi pelaaja
@app.route('/new_player', methods=['POST'])
def new_player():
    data = request.json
    screen_name = data.get('screen_name')
    if not screen_name:
        return jsonify({"error": "Player name is required"}), 400
    if does_player_exist(screen_name):
        return jsonify({"error": "Player already exists"}), 400
    player_id = add_player(screen_name)
    player_id = player_id['id']
    assign_monkey_countries(player_id)
    return jsonify({"player_id": player_id})

# Tarkistetaan onko pelaaja olemassa
@app.route('/player_exists/<screen_name>')
def player_exists(screen_name):
    exists = does_player_exist(screen_name)
    return jsonify ({"exists": exists})

# Haetaan game ID
@app.route('/game_id/<screen_name>')
def game_id(screen_name):
    gid = get_game_id(screen_name)
    if gid:
        found = monkeys_found_count(gid)
        p = Player(screen_name, gid)
        p.set_monkeys(found)
        return p.return_json()
    return jsonify({"error": "Player not found"}), 404

# Haetaan EU-maat
@app.route('/eu_countries')
def eu_countries():
    countries = get_eu_countries()
    return jsonify({"countries": [c.title() for c in countries]})

# Tarkista maa ja merkitse
@app.route('/visit_country', methods=['POST'])
def visit_country():
    data = request.json
    gid = data.get('game_id')
    country = data.get('country')
    country = country.title()
    found = check_country(gid, country)
    mark_country_visited(gid, country)
    return jsonify({"found": found})

# Monta apinaa löydetty
@app.route('/monkeys_found/<game_id>')
def found_count(game_id):
    count = monkeys_found_count(game_id)
    return jsonify({"found": count})

# Help-komento
@app.route('/help/<game_id>')
def help_view(game_id):
    data = help_command(game_id)
    return jsonify(data)

# Käydyt maat pelaajan mukaan
@app.route('/visited/<game_id>')
def visited(game_id):
    data = get_visited_countries(game_id)
    return jsonify({"visited": data})

if __name__ == '__main__':
    app.run(debug=True)