import json
import csv

with open('src/data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

with open('src/data/songs.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'title', 'description', 'image', 'spotify_player', 'apple_player'])
    for song in songs:
        writer.writerow([
            song.get('id'),
            song.get('title'),
            song.get('description'),
            song.get('image'),
            song.get('players', {}).get('spotify'),
            song.get('players', {}).get('apple')
        ])

print("songs.json has been converted to songs.csv")