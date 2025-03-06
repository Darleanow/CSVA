import functions_framework
import json
import hashlib
from flask import request
from google.cloud import storage
from google.oauth2 import id_token
from google.auth.transport import requests

# Configuration du stockage GCS
BUCKET_NAME = "csva-processed"
storage_client = storage.Client()

def get_user_folder_id(user_id):
    """
    Génère un identifiant de dossier sécurisé à partir de l'ID utilisateur.
    Utilise un hash SHA-256 pour créer un identifiant de longueur fixe.
    IMPORTANT: Cette fonction doit être IDENTIQUE à celle utilisée dans les autres fonctions
    """
    folder_id = hashlib.sha256(user_id.encode()).hexdigest()
    return folder_id

def get_old_user_folder_id(jwt_token):
    """
    Ancienne méthode - génère un identifiant de dossier à partir du JWT token.
    Pour compatibilité avec les anciennes analyses.
    """
    folder_id = hashlib.sha256(jwt_token.encode()).hexdigest()
    return folder_id

@functions_framework.http
def get_analysis(request):
    """Récupère les détails d'une analyse spécifique."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    try:
        # Vérification de l'authentification
        jwt_token = request.headers.get("Authorization")
        if not jwt_token:
            return (json.dumps({'error': 'User not authenticated'}), 401, headers)
            
        # Extraire le token si au format "Bearer <token>"
        if jwt_token.startswith('Bearer '):
            jwt_token = jwt_token.split('Bearer ')[1]

        # Récupérer l'ID d'analyse depuis les paramètres de requête
        analysis_id = request.args.get('id')
        if not analysis_id:
            return (json.dumps({'error': 'No analysis ID provided'}), 400, headers)

        # Essayer d'extraire l'ID utilisateur Firebase
        try:
            auth_req = requests.Request()
            decoded_token = id_token.verify_firebase_token(jwt_token, auth_req)
            user_id = decoded_token['user_id']  # L'ID stable de l'utilisateur
            print(f"User ID: {user_id}")
        except Exception as e:
            print(f"Erreur lors de la vérification du token: {str(e)}")
            # Fallback - utiliser le JWT entier
            user_id = jwt_token
            print(f"Fallback: Using JWT as user_id")

        # Récupérer le fichier JSON d'analyse
        bucket = storage_client.bucket(BUCKET_NAME)
        
        # Essayer d'abord avec le nouvel ID utilisateur
        user_folder_id = get_user_folder_id(user_id)
        print(f"Checking in new folder ID: {user_folder_id}")
        json_blob = bucket.blob(f"{user_folder_id}/{analysis_id}.json")
        
        # Si le fichier n'existe pas, essayer avec l'ancien format de dossier
        if not json_blob.exists():
            old_folder_id = get_old_user_folder_id(jwt_token)
            print(f"File not found in new location, trying old folder ID: {old_folder_id}")
            json_blob = bucket.blob(f"{old_folder_id}/{analysis_id}.json")
            
            if not json_blob.exists():
                return (json.dumps({'error': 'Analysis not found in any location'}), 404, headers)
                
            # Utiliser l'ancien ID de dossier pour les URLs
            user_folder_id = old_folder_id
            print(f"Found file in old folder structure: {old_folder_id}")
        
        # Lire le contenu du fichier JSON
        json_content = json_blob.download_as_text()
        analysis_data = json.loads(json_content)
        
        # S'assurer que les URLs de téléchargement sont présentes
        if 'csv_url' not in analysis_data:
            analysis_data['csv_url'] = f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.csv"
        if 'json_url' not in analysis_data:
            analysis_data['json_url'] = f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.json"
        
        return (json.dumps(analysis_data), 200, headers)

    except Exception as e:
        print(f"Error in get_analysis: {str(e)}")
        return (json.dumps({'error': f'Error retrieving analysis: {str(e)}'}), 500, headers)