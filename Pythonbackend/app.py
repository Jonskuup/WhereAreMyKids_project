from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

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
    help_command
)

# Oma api avain api-ninjas.com sivulta
api_key = "xHTffgL/GRv8RLLGL80Qow==Sh1uwO8NHZwCBfVJ"

app = Flask(__name__)
CORS(app)

@app.route("/flag/<country>", methods=["GET"])
def flag(country):
    iso = get_country_iso(country)
    if not iso:
        return jsonify({"error": "Country ISO code not found"}), 404

    url = f"https://api.api-ninjas.com/v1/countryflag?country={iso}"

    response = requests.get(url, headers={"X-Api-Key": api_key})

    if response.status_code == 200:
        data = response.json()
        return jsonify({
            "rectangle_image_url": data.get("rectangle_image_url")
        })
    else:
        return jsonify({"error": "Flag API request failed"}), 500


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
@app.route('/player_exists/<screen_name>', methods=['GET'])
def player_exists(screen_name):
    exists = does_player_exist(screen_name)
    return jsonify ({"exists": exists})

# Haetaan game ID
@app.route('/game_id/<screen_name>', methods=['GET'])
def game_id(screen_name):
    gid = get_game_id(screen_name)
    if gid:
        assign_monkey_countries(gid)
        return jsonify({"game_id": gid})
    return jsonify({"error": "Player not found"}), 404

# Haetaan EU-maat
@app.route('/eu_countries', methods=['GET'])
def eu_countries():
    countries = get_eu_countries()
    return jsonify({"countries": [c.title() for c in countries]})

# Tarkista maa ja merkitse
@app.route('/visit_country', methods=['POST'])
def visit_country():
    data = request.json
    gid = data.get('game_id')
    country = data.get('country')
    if not gid or not country:
        return jsonify({"error": "game_id and country are required"}), 400
    country = country.title()
    found = check_country(gid, country)
    mark_country_visited(gid, country)
    return jsonify({"found": found})

# Monta apinaa löydetty
@app.route('/monkeys_found/<game_id>', methods=['GET'])
def found_count(game_id):
    count = monkeys_found_count(game_id)
    return jsonify({"found": count})

# Help-komento
@app.route('/help/<game_id>', methods=['GET'])
def help_view(game_id):
    data = help_command(game_id)
    return jsonify(data)

# Käydyt maat pelaajan mukaan
@app.route('/visited/<game_id>', methods=['GET'])
def visited(game_id):
    from game_functions import get_visited_countries
    data = get_visited_countries(game_id)
    return jsonify({"visited": data})

if __name__ == '__main__':
    app.run(debug=True)