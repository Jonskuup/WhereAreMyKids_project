import json
from flask import Flask
from database import Database
from flask_cors import CORS

db = Database()
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/new_id')
def new_id():
    sql = "select max(id) from game"
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchone()
    max_id = result[0]
    new_id_number = max_id + 1
    return json.dumps(str(new_id_number))

@app.route('/new_player')
def new_player(player_id):
    new_id_number = new_id()
    player_id = new_player.lower()
    sql = f"insert into game (id, screen_name) values ('{new_id_number}', '{player_id}')"
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchone()
    return json.dumps(result)

@app.route('/player_exists/<player_id>')
def player_exists(player_id):
    sql = f"select count(*) from game where lower(screen_name) = lower('{player_id}')"
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchone()
    return json.dumps(result[0] > 0)

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)