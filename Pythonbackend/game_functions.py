import random

# PLAYER MANAGEMENT

# Haetaan game-taulusta suurin id-arvo ja palautetaan suurin arvo +1
def new_id(db):
    sql = "select max(id) from game"
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchone()
    max_id = result[0]
    new_id_number = max_id + 1
    return str(new_id_number)

# Lisätään uudet tiedot game-tauluun kohtaan id ja screen_name
def new_player(db, player_id):
    new_id_number = new_id(db)
    player_id = player_id.lower()
    sql = f"insert into game (id, screen_name) values (%s, %s)"
    cursor = db.get_conn().cursor(dictionary=True)
    values = (new_id_number, player_id)
    cursor.execute(sql, values)
    db.get_conn().commit()
    return {'id': new_id_number, 'screen_name': player_id}

# Tarkistetaan onko pelaajan antama nimimerkki jo käytössä
def player_exists(db, player_id):
    sql = f"select count(*) from game where lower(screen_name) = lower(%s)"
    cursor = db.get_conn().cursor(dictionary=True)
    value = player_id
    cursor.execute(sql, value)
    result = cursor.fetchone()[0] > 0
    return result

# Antaa nimimerkkiä vastaavan ID numeron
def get_game_id(db, player_id):
    sql = "select id from game where lower(screen_name) = lower(%s)"
    cursor = db.get_conn().cursor(dictionary=True)
    value = player_id
    cursor.execute(sql, value)
    result = cursor.fetchone()
    return result[0]

# COUNTRY/MONKEY MANAGEMENT

# Palauttaa kaikki EU maat
def get_eu_countries(db):
    sql = "select name from country where continent = 'EU'"
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    eu_countries = []
    for rivi in cursor.fetchall():
        eu_countries.append(rivi[0].lower())
    return eu_countries

# Arvotaan 10 EU-maata kadonneille apinapoikasille
def assign_monkey_countries(db, game_id):
    cursor = db.get_conn().cursor(dictionary=True)

    # Tarkistetaan onko pelaajalla jo arvottuja maita
    sql = f"select country_name from kadonneet_lapset where game_id = %s"
    value = game_id
    cursor.execute(sql, value)
    existing = cursor.fetchall()
    if existing:
        countries = []
        for rivi in existing:
            countries.append(rivi[0])
        return countries

    # Haetaan kaikki EU-maat
    all_eu_countries = get_eu_countries(db)
    all_eu_countries = [country.title() for country in all_eu_countries]

    # Arvotaan 10 EU-maata
    selected_countries = random.sample(all_eu_countries, 10)

    # Tallennetaan ne tietokantaan
    for country in selected_countries:
        sql = f"insert into kadonneet_lapset (game_id, country_name) values (%s, %s)"
        values = (game_id, country)
        cursor.execute(sql, values)

    db.get_conn().commit()
    return selected_countries

# Funktio joka tarkistaa monta poikasta on löydetty
def monkeys_found_count(db, game_id):
    sql = f"select count(*) from kadonneet_lapset where game_id = %s and löydetyt_lapset = 1"
    cursor = db.get_conn().cursor(dictionary=True)
    value = game_id
    cursor.execute(sql, value)
    result = cursor.fetchone()[0]
    return result

# Funktio, joka tarkistaa onko lapsi löydetty valitusta maasta
def check_country(db, game_id, country):
    sql = f"select löydetyt_lapset from kadonneet_lapset where game_id = %s and country_name = %s"
    cursor = db.get_conn().cursor(dictionary=True)
    values = (game_id, country)
    cursor.execute(sql, values)
    result = cursor.fetchone()

    # Päivitetään, että lapsi on löytynyt
    if result and result[0] == 0:
        sql = f"update kadonneet_lapset set löydetyt_lapset = 1 where game_id = %s and country_name = %s"
        values = (game_id, country)
        cursor.execute(sql, values)
        db.get_conn().commit()
        return True
    return False

# Funktio, joka merkitsee tietyn maan käydyksi tietokannassa
def mark_country_visited(db, game_id, country):
    sql = f"insert into käydyt_maat (game_id, country_name, käyty) values (%s, %s, 1)"
    cursor = db.get_conn().cursor(dictionary=True)
    values = (game_id, country)
    cursor.execute(sql, values)
    db.get_conn().commit()

# Help -komento
def help_command(db, game_id):
    cursor = db.get_conn().cursor(dictionary=True)

    # Haetaan kaikki EU-maat
    all_eu_countries = get_eu_countries(db)
    all_eu_countries = [country.title() for country in all_eu_countries]

    # Haetaan maat joissa pelaaja on jo käynyt
    sql = f"select country_name from käydyt_maat where game_id = %s and käyty = 1"
    value = game_id
    cursor.execute(sql, value)
    visited = []
    for rivi in cursor.fetchall():
        visited.append(rivi[0].lower())

    result = []
    for country in all_eu_countries:
        result.append({'name': country, 'visited': country.lower() in visited})
    return result
