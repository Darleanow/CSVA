import functions_framework
import uuid
import os
import tempfile
import pandas as pd
import json
import smtplib
import ssl
import hashlib
import jwt
from io import StringIO
from flask import request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google.cloud import storage
from google.cloud import secretmanager
import datetime
from google.oauth2 import id_token
from google.oauth2 import service_account
from google.auth.transport import requests

# SMTP server configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "Dev.esgim1@gmail.com"  
SENDER_PASSWORD = "sowq ythi nzzd zlkz"  

# GCS Storage configuration
BUCKET_NAME = "csva-processed"
storage_client = storage.Client()
secret_client = secretmanager.SecretManagerServiceClient()

def get_user_folder_id(user_id):
    
    folder_id = hashlib.sha256(user_id.encode()).hexdigest()
    return folder_id

def get_user_email_from_token(decoded_token):
    
    try:
        if 'email' in decoded_token:
            return decoded_token['email']
        elif 'claims' in decoded_token and 'email' in decoded_token['claims']:
            return decoded_token['claims']['email']
        else:
            return "Dev.esgim1@gmail.com"
    except:
        return "Dev.esgim1@gmail.com"

def save_to_gcs(user_folder_id, analysis_id, csv_data, json_data):
    """Sauvegarde le CSV et les résultats JSON dans un bucket GCS."""
    bucket = storage_client.bucket(BUCKET_NAME)

    print(f"Saving files to folder: {user_folder_id}")
    
    # CSV Storage
    csv_blob = bucket.blob(f"{user_folder_id}/{analysis_id}.csv")
    csv_blob.upload_from_string(csv_data, content_type="text/csv")
    print(f"CSV uploaded to {csv_blob.name}")

    # JSON Storage
    json_blob = bucket.blob(f"{user_folder_id}/{analysis_id}.json")
    json_blob.upload_from_string(json.dumps(json_data), content_type="application/json")
    print(f"JSON uploaded to {json_blob.name}")

    try:
        csv_exists = csv_blob.exists()
        json_exists = json_blob.exists()
        print(f"CSV file exists: {csv_exists}, JSON file exists: {json_exists}")
    except Exception as e:
        print(f"Error checking file existence: {str(e)}")

    return {
        "csv_url": f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.csv",
        "json_url": f"https://storage.googleapis.com/{BUCKET_NAME}/{user_folder_id}/{analysis_id}.json"
    }

@functions_framework.http
def process_csv(request):
    """Analyse un fichier CSV, détecte les anomalies et stocke le fichier + résultats dans GCS."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    try:
        # Auth check
        jwt_token = request.headers.get("Authorization")
        if not jwt_token:
            return (json.dumps({'error': 'User not authenticated'}), 401, headers)
            
        if jwt_token.startswith("Bearer "):
            jwt_token = jwt_token.split(" ")[1]

        print(f"Raw token (first 10 chars): {jwt_token[:10]}...")

        try:
            auth_req = requests.Request()
            decoded_token = id_token.verify_firebase_token(jwt_token, auth_req)
            user_id = decoded_token['user_id']  
            user_email = get_user_email_from_token(decoded_token)
            print(f"Successfully verified token. User ID: {user_id}, Email: {user_email}")
        except Exception as e:
            print(f"Erreur lors de la vérification du token: {str(e)}")
            
            user_email = get_user_email_from_jwt(jwt_token)
            user_id = jwt_token  
            print(f"Using fallback. JWT token as user_id: {user_id[:10]}..., Email: {user_email}")

        user_folder_id = get_user_folder_id(user_id)
        print(f"User folder ID: {user_folder_id}")

        try:
            bucket = storage_client.bucket(BUCKET_NAME)
            test_blob = bucket.blob(f"{user_folder_id}/test.txt")
            test_blob.upload_from_string("test", content_type="text/plain")
            print(f"Successfully wrote test file to {user_folder_id}/")
            test_blob.delete() 
        except Exception as e:
            print(f"Warning: Failed to write test file: {str(e)}")

        # CSV Checker
        content = request.data
        if not content:
            return (json.dumps({'error': 'No data provided'}), 400, headers)

        # Analysis ID generator
        analysis_id = str(uuid.uuid4())
        print(f"Generated analysis ID: {analysis_id}")

        # CSV Analysis
        data = StringIO(content.decode('utf-8'))
        df = pd.read_csv(data)

        # Anomaly detection
        anomalies = []
        for index, row in df.iterrows():
            errors = []
            if row['Prix'] < 0 or row['Prix'] > 500:
                errors.append("Invalid Prix")
            if row['Quantite'] <= 0 or row['Quantite'] > 1000:
                errors.append("Invalid quantite")
            if row['Note_Client'] < 0 or row['Note_Client'] > 5:
                errors.append("Invalid Note_Client")
            if errors:
                anomalies.append({'ID': row['ID'], 'Errors': errors})

        # Statistics calculation
        stats = {
            'Prix': df['Prix'].describe().to_dict(),
            'Quantite': df['Quantite'].describe().to_dict(),
            'Note_Client': df['Note_Client'].describe().to_dict()
        }

        # Timestamp Analysis
        timestamp = datetime.datetime.now().isoformat()

        analysis_result = {
            "jwt_token_hash": user_folder_id[:8],  
            "user_id": user_id,  
            "analysis_id": analysis_id,
            "timestamp": timestamp,
            "stats": stats,
            "anomalies": anomalies,
            "user_email": user_email
        }

        # GCS Backup
        csv_content = content.decode('utf-8')
        print(f"About to save to GCS with folder ID: {user_folder_id}, analysis ID: {analysis_id}")
        storage_paths = save_to_gcs(user_folder_id, analysis_id, csv_content, analysis_result)
        print(f"Storage completed. Paths: {storage_paths}")
        
        # Add Storage's URL
        final_result = {**analysis_result, **storage_paths}
        
        # Add send email function
        report = {
            'anomalies': anomalies,
            'statistics': stats,
            'storage_paths': storage_paths,
            'recipient_email': user_email
        }
        send_email_report(report)
        
        return (json.dumps(final_result), 200, headers)

    except Exception as e:
        print(f"Error in process_csv: {str(e)}")
        return (json.dumps({'error': f'Error processing CSV: {str(e)}'}), 400, headers)

# Fallback function
def get_user_email_from_jwt(jwt_token):
    """
    Extrait l'adresse email de l'utilisateur à partir du token JWT.
    Méthode de fallback pour la compatibilité.
    """
    try:
        decoded = jwt.decode(jwt_token, options={"verify_signature": False})
        
        if 'email' in decoded:
            return decoded['email']
        elif 'claims' in decoded and 'email' in decoded['claims']:
            return decoded['claims']['email']
        else:
            return "Dev.esgim1@gmail.com"
    except:
        return "Dev.esgim1@gmail.com"

def format_data_as_html(data, title):
    if not data:
        return f"<p style='color: #555;'>Aucune donnée disponible pour {title}.</p>"

    html = f"<h3>{title}"
    if title == "Anomalies détectées" and isinstance(data, list):
        html += f" ({len(data)})"
    html += " :</h3>"

    
    if isinstance(data, list):
        if not data:
            return f"<p style='color: #555;'>Aucune donnée disponible pour {title}.</p>"
            
        html += '<table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:14px;">'
        html += '<tr style="background-color: #007bff; color: white;">'
        
        for key in data[0].keys():
            html += f'<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">{key}</th>'
        html += '</tr>'

        for row in data:
            html += '<tr style="background-color: #f9f9f9;">'
            for value in row.values():
                cell_style = "color: #d9534f;" if "Invalid" in str(value) else ""
                html += f'<td style="border: 1px solid #ddd; padding: 8px; {cell_style}">{value}</td>'
            html += '</tr>'
    
    elif isinstance(data, dict):
        metric_rename = {
            "mean": "Moyenne",
            "median": "Médiane",
            "std": "Écart-type",
            "min": "Minimum",
            "max": "Maximum",
            "count": "Nombre d'observations",
            "25%": "1er quartile",
            "50%": "2e quartile (médiane)",
            "75%": "3e quartile"
        }
        
        html += '<table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:14px;">'
        
        html += '<tr style="background-color: #007bff; color: white;">'
        html += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Métrique</th>'
        
        for column in data.keys():
            html += f'<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">{column}</th>'
        html += '</tr>'
        
        metrics = set()
        for column_stats in data.values():
            metrics.update(column_stats.keys())
        metrics = sorted(metrics)
        
        for metric in metrics:
            metric_name = metric_rename.get(metric, metric)
            html += '<tr style="background-color: #f9f9f9;">'
            html += f'<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">{metric_name}</td>'
            
            for column in data.keys():
                value = data[column].get(metric, "N/A")
                if isinstance(value, (int, float)):
                    value = round(value, 2)
                html += f'<td style="border: 1px solid #ddd; padding: 8px;">{value}</td>'
            
            html += '</tr>'
    
    else:
        html += '<table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:14px;">'
        html += '<tr><td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="100%">Format de données non pris en charge</td></tr>'
    
    html += '</table>'
    return html

def get_service_account_key():
    """
    Retrieve the service account key from Secret Manager.
    
    Returns:
        str: The JSON key as a string.
    """
    try:
        project_id = "csva-449810"
        secret_name = "gcs-signer-key"
        name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        response = secret_client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        print(f"Error retrieving service account key: {str(e)}")
        raise

def get_credentials():
    try:
        key_json = get_service_account_key()
        fd, path = tempfile.mkstemp()
        try:
            with os.fdopen(fd, 'w') as tmp:
                tmp.write(key_json)
            credentials = service_account.Credentials.from_service_account_file(
                path, scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
            return credentials
        finally:
            os.unlink(path)
    
    except Exception as e:
        print(f"Error getting credentials: {str(e)}")
        return None

def create_signed_url(bucket_name, blob_name, expiration=3600):
    try:
        credentials = get_credentials()
        if credentials is None:
            raise Exception("Failed to get service account credentials")
        
        signing_client = storage.Client(credentials=credentials)
        
        bucket = signing_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(seconds=expiration),
            method="GET"
        )
        
        return url
    except Exception as e:
        print(f"Error creating signed URL: {str(e)}")
        analysis_id = blob_name.split('/')[-1].replace('.csv', '').replace('.json', '')
        file_type = 'csv' if blob_name.endswith('.csv') else 'json'
        return f"https://get-user-analyses-165250746259.europe-north1.run.app/download-file?id={analysis_id}&type={file_type}"
    
    
def send_email_report(report):
    try:
        print(f"Report content keys: {list(report.keys())}")
        
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        recipient_email = report.get('recipient_email', "Dev.esgim1@gmail.com")
        msg["To"] = recipient_email
        msg["Subject"] = "📊 Rapport d'Analyse CSV"

        csv_url = report['storage_paths']['csv_url']
        json_url = report['storage_paths']['json_url']
        print(f"Original URLs: CSV: {csv_url}, JSON: {json_url}")
        
        try:
            parts = csv_url.replace('https://storage.googleapis.com/', '').split('/')
            bucket_name = parts[0]  
            
            csv_blob_path = '/'.join(parts[1:])
            json_blob_path = '/'.join(json_url.replace('https://storage.googleapis.com/', '').split('/')[1:])
            
            print(f"Parsed: Bucket: {bucket_name}, CSV blob: {csv_blob_path}, JSON blob: {json_blob_path}")
        except Exception as e:
            print(f"Error parsing URLs: {str(e)}")
            csv_parts = csv_url.split('/')
            bucket_name = csv_parts[3]  
            user_folder = csv_parts[4]  
            csv_filename = csv_parts[5]  
            csv_blob_path = f"{user_folder}/{csv_filename}"
            json_blob_path = f"{user_folder}/{csv_filename.replace('.csv', '.json')}"
            print(f"Using fallback parsing: Bucket: {bucket_name}, CSV blob: {csv_blob_path}")
        
        try:
            csv_signed_url = create_signed_url(bucket_name, csv_blob_path, 7*24*3600)
            json_signed_url = create_signed_url(bucket_name, json_blob_path, 7*24*3600)
            print(f"Generated signed URLs successfully")
        except Exception as e:
            print(f"⚠️ Couldn't generate signed URLs: {str(e)}, using proxy URLs instead")
            analysis_id = csv_blob_path.split('/')[-1].replace('.csv', '')
            csv_signed_url = f"https://get-user-analyses-165250746259.europe-north1.run.app/download-file?id={analysis_id}&type=csv"
            json_signed_url = f"https://get-user-analyses-165250746259.europe-north1.run.app/download-file?id={analysis_id}&type=json"
            print(f"Using fallback URLs: CSV: {csv_signed_url}, JSON: {json_signed_url}")

        try:
            anomalies_html = format_data_as_html(report['anomalies'], "Anomalies détectées")
            stats_html = format_data_as_html(report['statistics'], "Statistiques")
            print("Successfully generated HTML tables")
        except Exception as e:
            print(f"Error generating HTML tables: {str(e)}")
            anomalies_html = "<p>Erreur lors du formatage des anomalies.</p>"
            stats_html = "<p>Erreur lors du formatage des statistiques.</p>"

        email_body = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
                }}
                h2 {{
                    color: #333;
                    text-align: center;
                }}
                .section {{
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                }}
                .section:last-child {{
                    border-bottom: none;
                }}
                .footer {{
                    text-align: center;
                    padding-top: 10px;
                    font-size: 12px;
                    color: #777;
                }}
                a {{
                    color: #007bff;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                .button {{
                    display: inline-block;
                    padding: 10px 15px;
                    margin-top: 10px;
                    color: white;
                    background: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                }}
                .button:hover {{
                    background: #0056b3;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }}
                th, td {{
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }}
                th {{
                    background-color: #007bff;
                    color: white;
                }}
                tr:nth-child(even) {{
                    background-color: #f9f9f9;
                }}
                .error {{
                    color: #d9534f;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>📊 Rapport d'Analyse CSV</h2>

                <div class="section">
                    {anomalies_html}
                </div>

                <div class="section">
                    {stats_html}
                </div>

                <div class="section">
                    <h3>📁 Fichiers stockés :</h3>
                    <p><a class="button" href="{csv_signed_url}">📂 Télécharger CSV</a></p>
                    <p><a class="button" href="{json_signed_url}">📂 Télécharger JSON</a></p>
                    <p style="font-size: 12px; color: #777;">Les liens sont valides pendant 7 jours.</p>
                </div>

                <div class="footer">
                    <p>🔍 Analyse automatique des données CSV</p>
                    <p>&copy; {datetime.datetime.now().year} DataAnalyzer</p>
                </div>
            </div>
        </body>
        </html>
        """

        print(f"Email body length: {len(email_body)} characters")

        try:
            msg.attach(MIMEText(email_body, "html"))
            print("Successfully attached HTML content to email")
        except Exception as e:
            print(f"Error attaching HTML content: {str(e)}")
            plain_text = "Rapport d'Analyse CSV - Veuillez consulter le portail web pour plus de détails."
            msg.attach(MIMEText(plain_text, "plain"))

        # Send the email
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())

        print(f"✅ Email envoyé avec succès à {recipient_email}!")
    except Exception as e:
        print(f"❌ Erreur détaillée lors de l'envoi de l'email : {type(e).__name__}: {str(e)}")
        import traceback
        print(traceback.format_exc())