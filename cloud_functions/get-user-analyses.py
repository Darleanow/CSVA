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
    IMPORTANT: Cette fonction doit être IDENTIQUE à celle utilisée dans process_csv
    """
    folder_id = hashlib.sha256(user_id.encode()).hexdigest()
    return folder_id

@functions_framework.http
def list_analyses(request):
    """Liste toutes les analyses disponibles pour un utilisateur."""
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
        
        # Extraire le token sans le préfixe "Bearer "
        if jwt_token.startswith('Bearer '):
            jwt_token = jwt_token.split('Bearer ')[1]
        
        # Vérifier et décoder le token pour obtenir l'ID utilisateur
        try:
            # Vérification du token Firebase
            auth_req = requests.Request()
            decoded_token = id_token.verify_firebase_token(jwt_token, auth_req)
            user_id = decoded_token['user_id']  # L'ID stable de l'utilisateur
            print(f"User ID: {user_id}")
        except Exception as e:
            print(f"Erreur lors de la vérification du token: {str(e)}")
            # Fallback - utiliser le JWT entier si la vérification échoue
            # Pour la compatibilité avec les anciens dossiers
            user_id = jwt_token
            print(f"Fallback: Using JWT as user_id")
        
        # Générer un ID de dossier utilisateur à partir de l'ID utilisateur
        user_folder_id = get_user_folder_id(user_id)
        print(f"User folder ID: {user_folder_id}")

        # Liste tous les fichiers JSON dans le dossier de l'utilisateur
        bucket = storage_client.bucket(BUCKET_NAME)
        blobs = list(bucket.list_blobs(prefix=f"{user_folder_id}/"))
        
        print(f"Number of blobs found: {len(blobs)}")
        
        analyses = []
        for blob in blobs:
            # Ne récupérer que les fichiers JSON (résultats d'analyses)
            if blob.name.endswith('.json'):
                analysis_id = blob.name.split('/')[-1].replace('.json', '')
                print(f"Processing blob: {blob.name}, analysis_id: {analysis_id}")
                
                try:
                    # Récupérer le contenu du JSON pour obtenir les métadonnées
                    json_content = blob.download_as_text()
                    metadata = json.loads(json_content)
                    
                    # Construire l'URL pour les fichiers CSV et JSON
                    csv_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.csv"
                    json_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.json"
                    
                    # Utiliser un nom de fichier basé sur l'ID court
                    filename = f"Analyse {analysis_id.split('-')[0]}"
                    
                    # Créer une entrée pour l'analyse avec les statistiques et anomalies si disponibles
                    analyses.append({
                        'analysis_id': analysis_id,
                        'timestamp': metadata.get('timestamp', blob.time_created.isoformat()),
                        'filename': filename,
                        'csv_url': csv_url,
                        'json_url': json_url,
                        'stats': metadata.get('stats', {}),
                        'anomalies': metadata.get('anomalies', [])
                    })
                except Exception as e:
                    print(f"Error processing blob {blob.name}: {str(e)}")
                    # En cas d'erreur, utiliser des valeurs par défaut
                    analyses.append({
                        'analysis_id': analysis_id,
                        'timestamp': blob.time_created.isoformat(),
                        'filename': f"Analyse {analysis_id.split('-')[0]}",
                        'csv_url': f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.csv",
                        'json_url': f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.json"
                    })
        
        # Trier par date de création (plus récent en premier)
        analyses.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        print(f"Total analyses found: {len(analyses)}")
        return (json.dumps({'analyses': analyses}), 200, headers)

    except Exception as e:
        print(f"Error in list_analyses: {str(e)}")
        return (json.dumps({'error': f'Error listing analyses: {str(e)}'}), 500, headers)