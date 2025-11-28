import os
import mysql.connector

class Database:
    def __init__(self):
        self.conn = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            database='flight_game',
            user='root',
            password='salasana',
            autocommit=True
        )
    def get_conn(self):
        return self.conn