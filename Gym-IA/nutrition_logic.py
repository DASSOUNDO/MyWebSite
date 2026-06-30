import os
import requests
import sqlite3
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

# --- MODÈLES ---
small_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
large_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

DB_PATH = os.path.join(os.path.dirname(__file__), "nutrition.db")

# --- 1. RECHERCHE LOCALE SQLite (directe, pas de SQL agent) ---
def search_local_db(query: str) -> list[dict]:
    """Recherche rapide par nom dans la base locale."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """SELECT nom, calories_100g, proteines_100g, lipides_100g, glucides_100g, categorie, stock_grammes
               FROM ingredients
               WHERE LOWER(nom) LIKE LOWER(?)
               LIMIT 5""",
            (f"%{query}%",)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows
    except Exception:
        return []

# --- 2. OPEN FOOD FACTS (gratuit, open source, sans clé API) ---
def fetch_open_food_facts(ingredient: str) -> list[dict]:
    """Recherche sur Open Food Facts — 0 clé API requise."""
    url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": ingredient,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 3,
        "fields": "product_name,nutriments",
        "lc": "fr",
    }
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return []
        products = resp.json().get("products", [])
        results = []
        for p in products:
            n = p.get("nutriments", {})
            name = p.get("product_name", "Inconnu")
            if not name:
                continue
            results.append({
                "nom": name,
                "calories_100g": round(n.get("energy-kcal_100g", 0), 1),
                "proteines_100g": round(n.get("proteins_100g", 0), 1),
                "lipides_100g": round(n.get("fat_100g", 0), 1),
                "glucides_100g": round(n.get("carbohydrates_100g", 0), 1),
                "source": "Open Food Facts",
            })
        return results
    except Exception:
        return []

# --- 3. RÉCUPÉRATION NUTRITION COMBINÉE ---
def get_nutrition_context(user_input: str) -> str:
    """Cherche en local d'abord, puis Open Food Facts si rien trouvé."""
    # Extraire les mots-clés principaux (on prend les mots > 3 lettres)
    keywords = [w for w in user_input.split() if len(w) > 3][:3]

    all_results = []
    for kw in keywords:
        local = search_local_db(kw)
        if local:
            all_results.extend(local)
        else:
            web = fetch_open_food_facts(kw)
            all_results.extend(web)

    if not all_results:
        return ""

    lines = ["Données nutritionnelles disponibles (pour 100g) :"]
    seen = set()
    for r in all_results[:5]:  # max 5 aliments
        nom = r["nom"]
        if nom in seen:
            continue
        seen.add(nom)
        source = r.get("source", "Base locale")
        lines.append(
            f"- {nom} [{source}]: {r['calories_100g']} kcal | "
            f"P: {r['proteines_100g']}g | L: {r['lipides_100g']}g | G: {r['glucides_100g']}g"
        )
    return "\n".join(lines)

# --- 4. DÉTECTION SALUTATION ---
SALUTATION_KEYWORDS = {"bonjour", "salut", "hello", "hi", "bonsoir", "coucou", "hey"}

def is_salutation(text: str) -> bool:
    words = set(text.lower().strip().rstrip("!?.").split())
    return bool(words & SALUTATION_KEYWORDS) and len(text.split()) <= 4

# --- 5. RÉPONSE PRINCIPALE ---
SYSTEM_PROMPT = """Tu es 'Nutri-IA PRO', un expert en nutrition, musculation et perte de graisse.
Réponds TOUJOURS en français, de manière structurée et pratique.
Si des données nutritionnelles sont fournies, utilise-les dans ta réponse.
Sois concis mais complet : propose des menus chiffrés, des conseils actionnables."""

def _build_messages(user_input: str, history: list) -> list:
    nutrition_ctx = get_nutrition_context(user_input)
    full_input = f"{user_input}\n\n{nutrition_ctx}" if nutrition_ctx else user_input
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": full_input})
    return messages


import re as _re

def _is_rate_limit(e: Exception) -> tuple[bool, str]:
    msg = str(e)
    if "429" in msg or "rate_limit_exceeded" in msg:
        m = _re.search(r"Please try again in ([\w.]+)", msg)
        wait = m.group(1) if m else "quelques minutes"
        return True, wait
    return False, ""


def stream_chat_response(user_input: str, history: list = []):
    """Générateur — yield les chunks de texte au fil du streaming Groq."""
    if not os.getenv("GROQ_API_KEY"):
        yield "⚠️ Clé API Groq manquante dans le fichier .env"
        return

    # Extraire le message réel (avant le contexte injecté par app.py)
    raw_input = user_input.split("\n\n[Contexte")[0].strip()

    if is_salutation(raw_input):
        try:
            for chunk in small_llm.stream(
                f"Réponds chaleureusement en 1 phrase à : '{raw_input}'. Tu es un coach nutrition IA."
            ):
                yield chunk.content
        except Exception:
            yield "Bonjour ! Comment puis-je vous aider avec votre nutrition ?"
        return

    messages = _build_messages(user_input, history)

    # 1er essai : grand modèle
    try:
        for chunk in large_llm.stream(messages):
            yield chunk.content
        return
    except Exception as e:
        rate_limited, wait = _is_rate_limit(e)
        if not rate_limited:
            yield f"⚠️ Erreur : {str(e)}"
            return

    # Fallback : petit modèle (quota séparé)
    yield f"> ⚡ *Quota journalier atteint sur Llama 3.3 (réinitialisé dans {wait}). Passage sur Llama 3.1 8B...*\n\n"
    try:
        # Réduire l'historique pour économiser les tokens
        short_messages = _build_messages(user_input, history[-2:])
        for chunk in small_llm.stream(short_messages):
            yield chunk.content
    except Exception as e2:
        rate_limited2, wait2 = _is_rate_limit(e2)
        if rate_limited2:
            yield f"\n\n⚠️ Les deux modèles ont atteint leur quota. Réessayez dans **{wait2}**."
        else:
            yield f"\n\n⚠️ Erreur : {str(e2)}"
