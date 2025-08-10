import requests
import json
import base64
import os
import time
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
from fuzzywuzzy import fuzz

load_dotenv()

# --- Apple Music API Credentials (from .env) ---
APPLE_TEAM_ID = os.getenv('APPLE_TEAM_ID')
APPLE_KEY_ID = os.getenv('APPLE_KEY_ID')
APPLE_PRIVATE_KEY = os.getenv('APPLE_PRIVATE_KEY')
APPLE_STOREFRONT = 'jp' # Assuming Japan storefront for now, can be made configurable

# Matching thresholds (can be adjusted)
TITLE_MATCH_THRESHOLD = 85
ARTIST_MATCH_THRESHOLD = 75
ALBUM_MATCH_THRESHOLD = 70

if not all([APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY]):
    print("Error: Apple Music API credentials (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY) are not set in .env")
    exit(1)

# --- JWT Generation ---
def generate_developer_token():
    headers = {
        "alg": "ES256",
        "kid": APPLE_KEY_ID
    }
    payload = {
        "iss": APPLE_TEAM_ID,
        "iat": int(time.time()),
        "exp": int(time.time()) + (60 * 60), # Token valid for 1 hour
    }
    # Ensure the private key is correctly formatted for PyJWT
    # It might need to be bytes, and newlines handled if it came from a single line env var
    private_key_bytes = APPLE_PRIVATE_KEY.encode('utf-8')
    
    # If the private key was stored with escaped newlines, unescape them
    if b'\n' in private_key_bytes:
        private_key_bytes = private_key_bytes.replace(b'\n', b'\n')

    encoded_jwt = jwt.encode(payload, private_key_bytes, algorithm="ES256", headers=headers)
    return encoded_jwt

# --- Apple Music API Search Function ---
def search_apple_music(title, artist, developer_token):
    search_url = f"https://api.music.apple.com/v1/catalog/{APPLE_STOREFRONT}/search"
    headers = {
        "Authorization": f"Bearer {developer_token}"
    }
    params = {
        "term": f"{title} {artist}",
        "types": "songs",
        "limit": 10 # Get more results for fuzzy matching
    }
    try:
        response = requests.get(search_url, headers=headers, params=params)
        response.raise_for_status() # Raise an exception for HTTP errors
        data = response.json()
        
        if data and 'results' in data and 'songs' in data['results'] and data['results']['songs']['data']:
            return data['results']['songs']['data']
        return []
    except requests.exceptions.RequestException as e:
        print(f"Error searching Apple Music for '{title}' by '{artist}': {e}")
        return []

# --- Fuzzy Matching Function ---
def find_best_match(spotify_title, spotify_artist, spotify_album, apple_music_candidates):
    best_match = None
    highest_score = -1

    for candidate in apple_music_candidates:
        candidate_title = candidate.get('attributes', {}).get('name', '')
        candidate_artist = candidate.get('attributes', {}).get('artistName', '')
        candidate_album = candidate.get('attributes', {}).get('albumName', '')

        title_score = fuzz.ratio(spotify_title.lower(), candidate_title.lower())
        artist_score = fuzz.ratio(spotify_artist.lower(), candidate_artist.lower())
        album_score = fuzz.ratio(spotify_album.lower(), candidate_album.lower()) if spotify_album else 0

        # Weighted score (adjust weights as needed)
        # Prioritize title, then artist, then album
        combined_score = (
            title_score * 0.6 + 
            artist_score * 0.3 + 
            album_score * 0.1
        )

        # Apply thresholds
        if (title_score >= TITLE_MATCH_THRESHOLD and
            artist_score >= ARTIST_MATCH_THRESHOLD and
            (spotify_album == '' or album_score >= ALBUM_MATCH_THRESHOLD)):
            
            if combined_score > highest_score:
                highest_score = combined_score
                best_match = candidate
    
    return best_match

# --- Main Logic ---
def update_songs_with_apple_music_links():
    try:
        with open('src/data/songs.json', 'r', encoding='utf-8') as f:
            songs_data = json.load(f)
    except FileNotFoundError:
        print("Error: src/data/songs.json not found. Please run fetch_spotify_playlist.py first.")
        return

    developer_token = generate_developer_token()
    print("Generated Apple Music Developer Token.")

    updated_count = 0
    for i, song in enumerate(songs_data):
        title = song.get('title')
        artist = song.get('artist_name')
        album = song.get('album_name', '') # Get album name from Spotify data
        
        if title and artist and (song.get('players', {}).get('apple') is None or song.get('players', {}).get('apple') == ''):
            print(f"Searching Apple Music for: {title} by {artist}...")
            apple_music_candidates = search_apple_music(title, artist, developer_token)
            
            if apple_music_candidates:
                best_match = find_best_match(title, artist, album, apple_music_candidates)
                
                if best_match:
                    # Construct embed URL from best_match
                    album_id = best_match['relationships']['albums']['data'][0]['id'] if 'albums' in best_match['relationships'] and best_match['relationships']['albums']['data'] else None
                    track_id = best_match['id']
                    
                    if album_id and track_id:
                        embed_url = f"https://embed.music.apple.com/{APPLE_STOREFRONT}/album/{album_id}/{track_id}?app=music"
                        apple_embed_iframe = f'<iframe src="{embed_url}" width="100%" height="152" frameborder="0" allow="autoplay; encrypted-media;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>'
                        
                        if 'players' not in song:
                            song['players'] = {}
                        song['players']['apple'] = apple_embed_iframe
                        updated_count += 1
                        print(f"  -> Found and updated Apple Music link for '{title}'.")
                    else:
                        print(f"  -> Could not construct embed URL for '{title}' (missing album/track ID).")
                else:
                    print(f"  -> No good match found on Apple Music for '{title}'.")
            else:
                print(f"  -> No search results from Apple Music for '{title}'.")
        else:
            print(f"Skipping '{title}' (already has Apple Music link or missing title/artist).")

    with open('src/data/songs.json', 'w', encoding='utf-8') as f:
        json.dump(songs_data, f, ensure_ascii=False, indent=2)

    print(f"Updated src/data/songs.json with {updated_count} Apple Music links.")

if __name__ == "__main__":
    update_songs_with_apple_music_links()
