import csv
import json
import re

def standardize_iframe_dimensions(iframe_html):
    if not iframe_html:
        return None
    
    # Pattern to find iframe tag and optionally capture attributes
    pattern = r'<iframe(?P<attrs>[^>]*)>'
    match = re.search(pattern, iframe_html)

    if match:
        attrs_str = match.group('attrs')
        
        # Use a dictionary to manage attributes for easier manipulation
        attrs = {}
        # Find all existing attributes
        for attr_match in re.finditer(r'(\w+)="(.*?)"', attrs_str):
            attrs[attr_match.group(1)] = attr_match.group(2)
        
        # Handle 'style' attribute to remove max-width
        if 'style' in attrs:
            style_content = attrs['style']
            # Remove max-width property
            style_content = re.sub(r'max-width:\s*[^;]+;?', '', style_content)
            # Clean up extra spaces or semicolons
            style_content = style_content.strip().replace(';;', ';')
            if style_content:
                attrs['style'] = style_content
            else:
                del attrs['style'] # Remove style if it becomes empty
        
        # Set desired width and height
        attrs['width'] = '100%'
        attrs['height'] = '152'
        
        # Reconstruct the attributes string
        new_attrs_list = []
        # Preserve order of some common attributes if they exist
        ordered_keys = ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'sandbox', 'loading']
        for key in ordered_keys:
            if key in attrs:
                new_attrs_list.append(f'{key}="{attrs[key]}"')
                attrs.pop(key) # Remove from attrs to avoid duplication
        
        # Add any remaining attributes
        for key, value in attrs.items():
            new_attrs_list.append(f'{key}="{value}"')

        new_attrs_str = ' '.join(new_attrs_list)
        
        # Reconstruct the iframe tag
        iframe_html = re.sub(pattern, f'<iframe {new_attrs_str}>' + iframe_html[match.end():], iframe_html, 1)
        
    return iframe_html


def convert_csv_to_json():
    songs = []
    try:
        with open('src/data/songs.csv', 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                song_id = int(row.get('id'))
                spotify_player_html = row.get('spotify_player')
                apple_player_html = row.get('apple_player')

                # Standardize player dimensions
                standardized_spotify_player = standardize_iframe_dimensions(spotify_player_html)
                standardized_apple_player = standardize_iframe_dimensions(apple_player_html)

                song = {
                    'id': song_id,
                    'title': row.get('title'),
                    'artist_name': row.get('artist_name'),
                    'album_name': row.get('album_name'),
                    'description': row.get('description'),
                    'image': row.get('image'),
                    'players': {
                        'spotify': standardized_spotify_player,
                        'apple': standardized_apple_player
                    }
                }
                songs.append(song)
    except FileNotFoundError:
        print("Error: src/data/songs.csv not found. Please ensure the CSV file exists.")
        return
    except Exception as e:
        print(f"An error occurred while reading the CSV: {e}")
        return

    try:
        with open('src/data/songs.json', 'w', encoding='utf-8') as jsonfile:
            json.dump(songs, jsonfile, ensure_ascii=False, indent=2)
        print(f"Successfully converted {len(songs)} songs from CSV to JSON.")
    except Exception as e:
        print(f"An error occurred while writing the JSON: {e}")

if __name__ == "__main__":
    convert_csv_to_json()
