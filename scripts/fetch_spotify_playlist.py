import requests
import json
import base64
import os
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
playlist_id = '0xpZUigLaFXANKYpRHOMV5'

# Step 1: Get an access token
auth_url = 'https://accounts.spotify.com/api/token'
auth_headers = {
    'Authorization': 'Basic ' + base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()
}
auth_data = {
    'grant_type': 'client_credentials'
}
auth_response = requests.post(auth_url, headers=auth_headers, data=auth_data)
access_token = auth_response.json()['access_token']

# Step 2: Get playlist tracks with pagination
tracks_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'
headers = {
    'Authorization': f'Bearer {access_token}'
}
all_tracks = []
while tracks_url:
    tracks_response = requests.get(tracks_url, headers=headers)
    tracks_data = tracks_response.json()
    all_tracks.extend(tracks_data['items'])
    tracks_url = tracks_data.get('next')


# Step 3 & 4: Process tracks and create new songs data
new_songs = []
for i, track_item in enumerate(all_tracks):
    track = track_item['track']
    if track:
        song_id = i + 1
        title = track['name']
        track_id = track['id']
        album_name = track['album']['name']
        artist_name = track['artists'][0]['name'] if track['artists'] else ''
        spotify_embed_url = f'https://open.spotify.com/embed/track/{track_id}?utm_source=generator&theme=0'
        
        new_songs.append({
            'id': song_id,
            'title': title,
            'artist_name': artist_name,
            'album_name': album_name,
            'description': f'{song_id:03d}日目の紹介文',
            'image': f'/images/{song_id:03d}.jpg',
            'players': {
                'spotify': f'<iframe src="{spotify_embed_url}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
                'apple': None
            }
        })

# Step 5: Write to songs.json
with open('src/data/songs.json', 'w', encoding='utf-8') as f:
    json.dump(new_songs, f, ensure_ascii=False, indent=2)

print(f"songs.json has been updated with {len(new_songs)} tracks from the playlist.")