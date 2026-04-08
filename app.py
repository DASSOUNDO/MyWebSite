import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# On importe les outils pour lire le HTML de ton site et pour le modèle IA Local.
# À installer avant de lancer le script: pip install flask flask-cors bs4 transformers torch
try:
    from bs4 import BeautifulSoup
    from transformers import pipeline
except ImportError:
    print("ATTENTION: Il te manque des librairies ! Lance dans ton terminal : pip install bs4 transformers torch")

app = Flask(__name__)
CORS(app)

# =========================================================================
# ÉTAPE 1 : RÉCUPÉRATION DU CONTEXTE (Retrieval)
# C'est la première étape d'un agent IA (RAG) : il lui faut des données.
# =========================================================================
def get_website_context():
    """
    Cette fonction va littéralement "lire" ton site à ta place pour comprendre
    tes projets, tes expériences et tes compétences.
    """
    try:
        # On lit le fichier index.html localement
        file_path = os.path.join(os.path.dirname(__file__), 'index.html')
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        soup = BeautifulSoup(html_content, 'html.parser')
        
        text = "Les informations sur Adébayo Dassoundo extraites du site :\n"
        
        # On extrait le texte des sections importantes
        for section_id in ['experience', 'projets', 'education']:
            section = soup.find(id=section_id)
            if section:
                text += section.get_text(separator=' ', strip=True) + "\n\n"
                
        # On limite la taille pour ne pas faire exploser la mémoire du modèle local
        return text[:1000]
    except Exception as e:
        print("Erreur lors de la lecture du site :", e)
        return "Adébayo est un ingénieur en systèmes embarqués et IA."

# On charge les connaissances au démarrage
CONTEXTE_SITE = get_website_context()


# =========================================================================
# ÉTAPE 2 : LE MODÈLE (L'Intelligence)
# =========================================================================
print("🤖 Lancement de l'Agent IA. Chargement du Modèle Local...")
# J'utilise SmolLM-135M-Instruct car c'est un très petit modèle (~500Mo)
# Idéal pour débuter et comprendre : il tournera même sans carte graphique !
try:
    # `pipeline` est la façon la plus simple d'utiliser HuggingFace.
    chatbot_model = pipeline(
        "text-generation", 
        model="HuggingFaceTB/SmolLM-135M-Instruct", 
        device=-1 # -1 = CPU (ton processeur normal). Met 0 si tu as une grosse carte graphique.
    )
    print("✅ Modèle local (SmolLM) prêt à l'emploi !")
except Exception as e:
    chatbot_model = None
    print("⚠️ Le modèle n'a pas pu charger. Assure-toi d'avoir installé les librairies (torch, transformers).")


# =========================================================================
# ÉTAPE 3 : L'AGENT ET LA REQUÊTE
# =========================================================================
@app.route('/api/chat', methods=['POST'])
def chat():
    if not chatbot_model:
        return jsonify({"reply": "Mon cerveau IA n'a pas réussi à s'initialiser. Vérifiez le terminal Python."})

    data = request.json
    user_message = data.get('message', '')

    # Le "Prompt" : on indique au modèle sa personnalité, ce qu'il sait, et ce qu'on lui demande.
    prompt = f"""Tu es l'assistant du portfolio de Adébayo Dassoundo. Réponds brièvement en français à la question de l'utilisateur à partir des informations suivantes :

{CONTEXTE_SITE}

Question de l'utilisateur : {user_message}
Ta réponse (courte et professionnelle) : """

    try:
        # On demande au modèle d'écrire la suite de "Ta réponse : "
        # max_new_tokens : limite le nombre de mots pour qu'il ne parle pas indéfiniment.
        output = chatbot_model(prompt, max_new_tokens=40, temperature=0.7, do_sample=True, num_return_sequences=1)
        generated_text = output[0]['generated_text']
        
        # On "nettoie" la réponse
        reply = generated_text.split("Ta réponse (courte et professionnelle) :")[-1].strip()
        
        # Si le modèle est trop bavard on coupe un peu
        if not reply:
            reply = "Je n'ai pas pu trouver l'information, mais lisez le site ;)"
            
    except Exception as e:
        reply = "Oups, une erreur interne au réseau neuronal s'est produite."

    return jsonify({"reply": reply})

if __name__ == '__main__':
    # Démarre le serveur
    app.run(port=5000, debug=True)
