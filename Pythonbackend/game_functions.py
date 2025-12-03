from database import Database
import random

# Luo tietokantayhteys
db = Database()

# PLAYER MANAGEMENT

# Haetaan game-taulusta suurin id-arvo ja palautetaan suurin arvo +1
def get_new_id():
    sql = "select max(id) from game"
    cursor = db.get_conn().cursor()
    cursor.execute(sql)
    result = cursor.fetchone()
    cursor.close()
    max_id = result[0] if result[0] else 0
    new_id_number = max_id + 1
    return str(new_id_number)

# Lisätään uusi pelaaja
def add_player(screen_name):
    id_number = get_new_id()
    screen_name = screen_name.lower()
    sql = f"insert into game (id, screen_name) values (%s, %s)"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (id_number, screen_name))
    db.get_conn().commit()
    cursor.close()
    return {'id': id_number, 'screen_name': screen_name}

# Tarkistetaan onko pelaajan antama nimimerkki jo käytössä
def does_player_exist(screen_name):
    sql = f"select count(*) from game where lower(screen_name) = lower(%s)"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (screen_name,))
    result = cursor.fetchone()[0] > 0
    cursor.close()
    return result

# Antaa nimimerkkiä vastaavan ID numeron
def get_game_id(screen_name):
    sql = "select id from game where lower(screen_name) = lower(%s)"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (screen_name,))
    result = cursor.fetchone()
    cursor.close()
    if result:
        return result[0]
    return None

# COUNTRY/MONKEY MANAGEMENT

# Palauttaa kaikki EU maat
def get_eu_countries():
    sql = "select name from country where continent = 'EU'"
    cursor = db.get_conn().cursor()
    cursor.execute(sql)
    eu_countries = []
    for rivi in cursor.fetchall():
        eu_countries.append(rivi[0].lower())
    cursor.close()
    return eu_countries

# Arvotaan 10 EU-maata kadonneille apinapoikasille
def assign_monkey_countries(game_id):
    cursor = db.get_conn().cursor()

    # Tarkistetaan onko pelaajalla jo arvottuja maita
    sql = f"select country_name from kadonneet_lapset where game_id = %s"
    cursor.execute(sql, (game_id,))
    existing = cursor.fetchall()
    if existing:
        countries = []
        for rivi in existing:
            countries.append(rivi[0])
        cursor.close()
        return countries

    # Haetaan kaikki EU-maat
    all_eu_countries = [country.title() for country in get_eu_countries()]

    # Arvotaan 10 EU-maata
    selected_countries = random.sample(all_eu_countries, 10)

    # Tallennetaan ne tietokantaan
    for country in selected_countries:
        sql = f"insert into kadonneet_lapset (game_id, country_name) values (%s, %s)"
        cursor.execute(sql, (game_id, country))

    db.get_conn().commit()
    cursor.close()
    return selected_countries

# Funktio joka tarkistaa monta poikasta on löydetty
def monkeys_found_count(game_id):
    sql = f"select count(*) from kadonneet_lapset where game_id = %s and löydetyt_lapset = 1"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (game_id,))
    result = cursor.fetchone()[0]
    cursor.close()
    return result

# Funktio, joka tarkistaa onko lapsi löydetty valitusta maasta
def check_country(game_id, country):
    sql = f"select löydetyt_lapset from kadonneet_lapset where game_id = %s and country_name = %s"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (game_id, country))
    result = cursor.fetchone()

    # Päivitetään, että lapsi on löytynyt
    found = False
    if result and result[0] == 0:
        sql = f"update kadonneet_lapset set löydetyt_lapset = 1 where game_id = %s and country_name = %s"
        cursor.execute(sql, (game_id, country))
        db.get_conn().commit()
        found = True
    cursor.close()
    return found

# Funktio, joka merkitsee tietyn maan käydyksi tietokannassa
def mark_country_visited(game_id, country):
    sql = f"insert into käydyt_maat (game_id, country_name, käyty) values (%s, %s, 1)"
    cursor = db.get_conn().cursor()
    cursor.execute(sql, (game_id, country))
    db.get_conn().commit()
    cursor.close()

# Help -komento
def help_command(game_id):
    cursor = db.get_conn().cursor()

    # Haetaan kaikki EU-maat
    all_eu_countries = [country.title() for country in get_eu_countries()]

    # Haetaan maat joissa pelaaja on jo käynyt
    sql = f"select country_name from käydyt_maat where game_id = %s and käyty = 1"
    cursor.execute(sql, (game_id,))
    visited = []
    for rivi in cursor.fetchall():
        visited.append(rivi[0].lower())

    result = []
    for country in all_eu_countries:
        result.append({'name': country, 'visited': country.lower() in visited})
    cursor.close()
    return result
