import streamlit as st
import pandas as pd
import sqlite3
import os
from nutrition_logic import stream_chat_response

st.set_page_config(
    page_title="Nutri-IA · Coach Nutrition",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

DB_PATH = os.path.join(os.path.dirname(__file__), "nutrition.db")

# ── THEME ─────────────────────────────────────────────────────────────────────
if "theme" not in st.session_state:
    st.session_state.theme = "dark"

is_dark = st.session_state.theme == "dark"

# Palette complète dark / light
if is_dark:
    C = {
        "app_bg":       "#080c14",
        "sidebar_bg":   "#0d1117",
        "sidebar_brd":  "rgba(255,255,255,0.05)",
        "text":         "#c8d6e5",
        "text_strong":  "#e8f0fa",
        "text_muted":   "#4a5568",
        "label":        "#94a3b8",
        "card_bg":      "rgba(255,255,255,0.03)",
        "card_bg_solid":"#111827",
        "card_brd":     "rgba(255,255,255,0.07)",
        "input_bg":     "#161c2d",
        "input_brd":    "rgba(255,255,255,0.1)",
        "input_text":   "#e2e8f0",
        "scrollbar":    "#1e293b",
        "sb_section":   "rgba(255,255,255,0.03)",
        "sb_brd":       "rgba(255,255,255,0.06)",
        "divider":      "rgba(255,255,255,0.05)",
        "expander_bg":  "#111827",
        "table_bg":     "#0d1117",
        "table_text":   "#c8d6e5",
        "table_hdr":    "#161c2d",
        "accent":       "#00e87a",
        "accent_dim":   "rgba(0,232,122,0.08)",
        "accent_brd":   "rgba(0,232,122,0.25)",
        "shadow":       "rgba(0,0,0,0.4)",
    }
else:
    C = {
        "app_bg":       "#f1f5f9",
        "sidebar_bg":   "#ffffff",
        "sidebar_brd":  "#e2e8f0",
        "text":         "#1e293b",
        "text_strong":  "#0f172a",
        "text_muted":   "#64748b",
        "label":        "#475569",
        "card_bg":      "#ffffff",
        "card_bg_solid":"#ffffff",
        "card_brd":     "#e2e8f0",
        "input_bg":     "#ffffff",
        "input_brd":    "#cbd5e0",
        "input_text":   "#1e293b",
        "scrollbar":    "#cbd5e0",
        "sb_section":   "#f8fafc",
        "sb_brd":       "#e2e8f0",
        "divider":      "#e2e8f0",
        "expander_bg":  "#f8fafc",
        "table_bg":     "#ffffff",
        "table_text":   "#1e293b",
        "table_hdr":    "#f1f5f9",
        "accent":       "#00a85a",
        "accent_dim":   "rgba(0,168,90,0.08)",
        "accent_brd":   "rgba(0,168,90,0.3)",
        "shadow":       "rgba(0,0,0,0.08)",
    }

# ── CSS GLOBAL ────────────────────────────────────────────────────────────────
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

/* ══ RESET ══ */
*, *::before, *::after {{ box-sizing: border-box; }}
html, body, .stApp {{ font-family: 'Inter', sans-serif !important; }}

/* ══ APP BACKGROUND ══ */
.stApp, .main, [data-testid="stAppViewContainer"] {{
    background: {C['app_bg']} !important;
    color: {C['text']} !important;
}}
[data-testid="stAppViewBlockContainer"] {{
    background: {C['app_bg']} !important;
}}

/* ══ HIDE STREAMLIT CHROME ══ */
#MainMenu, footer {{ visibility: hidden; }}
.stDeployButton {{ display: none !important; }}
/* Header : fond assorti au thème, aucune manipulation des enfants */
header[data-testid="stHeader"] {{
    background: {C['app_bg']} !important;
    box-shadow: none !important;
}}

/* ══ SIDEBAR ══ */
section[data-testid="stSidebar"],
section[data-testid="stSidebar"] > div,
section[data-testid="stSidebar"] > div:first-child {{
    background: {C['sidebar_bg']} !important;
    border-right: 1px solid {C['sidebar_brd']} !important;
    padding-top: 0 !important;
}}
[data-testid="stSidebarContent"] {{
    background: {C['sidebar_bg']} !important;
}}

/* ══ GLOBAL TEXT ══ */
p, span, div, label, h1, h2, h3, h4 {{
    color: {C['text']};
}}
.stMarkdown, .stMarkdown p, .stMarkdown span,
[data-testid="stMarkdownContainer"] p,
[data-testid="stMarkdownContainer"] {{
    color: {C['text']} !important;
}}

/* ══ SIDEBAR LABELS ══ */
[data-testid="stSidebar"] label,
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] span,
[data-testid="stSidebar"] .stMarkdown p {{
    color: {C['label']} !important;
}}

/* ══ SELECTBOX ══ */
.stSelectbox label {{ color: {C['label']} !important; }}
.stSelectbox [data-baseweb="select"] > div,
.stSelectbox [data-baseweb="select"] > div:focus-within {{
    background: {C['input_bg']} !important;
    border-color: {C['input_brd']} !important;
    border-radius: 10px !important;
}}
.stSelectbox [data-baseweb="select"] span,
.stSelectbox [data-baseweb="select"] div {{
    color: {C['input_text']} !important;
    background: transparent !important;
}}
/* dropdown list */
[data-baseweb="popover"] ul,
[data-baseweb="menu"] {{
    background: {C['card_bg_solid']} !important;
    border: 1px solid {C['card_brd']} !important;
}}
[data-baseweb="menu"] li, [data-baseweb="menu"] li span {{
    color: {C['text']} !important;
}}
[data-baseweb="menu"] li:hover {{
    background: {C['accent_dim']} !important;
}}

/* ══ NUMBER INPUT ══ */
.stNumberInput label {{ color: {C['label']} !important; }}
.stNumberInput input {{
    background: {C['input_bg']} !important;
    border-color: {C['input_brd']} !important;
    color: {C['input_text']} !important;
    border-radius: 10px !important;
}}
.stNumberInput [data-testid="stNumberInputField"] {{
    background: {C['input_bg']} !important;
}}

/* ══ SLIDER ══ */
.stSlider label {{ color: {C['label']} !important; }}
.stSlider [data-testid="stSliderThumb"] {{ background: {C['accent']} !important; }}
.stSlider [data-testid="stSlider"] > div > div {{
    background: {C['accent_dim']} !important;
}}

/* ══ SCROLLBAR ══ */
::-webkit-scrollbar {{ width: 4px; }}
::-webkit-scrollbar-track {{ background: transparent; }}
::-webkit-scrollbar-thumb {{ background: {C['scrollbar']}; border-radius: 99px; }}

/* ══ LOGO / HERO ══ */
.hero {{
    display: flex; align-items: center;
    gap: 1.2rem; padding: 0.8rem 1.2rem 1rem;
}}
.hero-icon {{
    width: 48px; height: 48px;
    background: linear-gradient(135deg, {C['accent']}, #00b4d8);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 0 20px {C['accent_dim']};
    flex-shrink: 0;
}}
.hero-text h1 {{
    font-size: 1.25rem; font-weight: 700;
    background: linear-gradient(90deg, {C['accent']}, #00b4d8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    line-height: 1.2;
}}
.hero-text p {{ font-size: 0.75rem; color: {C['text_muted']}; margin-top: 2px; }}

/* ══ SIDEBAR SECTIONS ══ */
.sb-section {{
    margin: 0 0.8rem 0.8rem;
    background: {C['sb_section']};
    border: 1px solid {C['sb_brd']};
    border-radius: 14px;
    padding: 1rem 1rem;
}}
.sb-label {{
    font-size: 0.65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: {C['text_muted']}; margin-bottom: 0.7rem;
    display: block;
}}

/* ══ CHAT MESSAGES ══ */
div[data-testid="stChatMessage"],
.stChatMessage {{
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0.2rem 0 !important;
}}
/* Un seul fond : sur stChatMessageContent uniquement */
/* IA bubble */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarAssistant"]) [data-testid="stChatMessageContent"] {{
    background: {C['card_bg']} !important;
    border: 1px solid {C['card_brd']} !important;
    border-radius: 4px 18px 18px 18px !important;
    padding: 1rem 1.2rem !important;
    box-shadow: 0 2px 8px {C['shadow']};
}}
/* User bubble */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarUser"]) [data-testid="stChatMessageContent"] {{
    background: {C['accent_dim']} !important;
    border: 1px solid {C['accent_brd']} !important;
    border-radius: 18px 4px 18px 18px !important;
    padding: 0.9rem 1.2rem !important;
}}
/* Les enfants de stChatMessageContent (stMarkdownContainer, etc.) : transparents */
[data-testid="stChatMessageContent"] > * {{
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
}}
[data-testid="stChatMessageContent"] p,
[data-testid="stChatMessageContent"] li,
[data-testid="stChatMessageContent"] strong {{
    color: {C['text']} !important;
}}

/* ══ CHAT INPUT ══ */
.stChatInput > div, [data-testid="stChatInput"] > div {{
    background: {C['input_bg']} !important;
    border: 1px solid {C['input_brd']} !important;
    border-radius: 16px !important;
    box-shadow: 0 2px 8px {C['shadow']};
}}
.stChatInput > div:focus-within {{
    border-color: {C['accent']} !important;
    box-shadow: 0 0 0 3px {C['accent_dim']} !important;
}}
.stChatInput textarea {{
    background: transparent !important;
    color: {C['input_text']} !important;
    font-size: 0.95rem !important;
}}
.stChatInput textarea::placeholder {{ color: {C['text_muted']} !important; }}

/* ══ BUTTONS ══ */
.stButton > button {{
    background: {C['accent_dim']} !important;
    border: 1px solid {C['accent_brd']} !important;
    border-radius: 12px !important;
    color: {C['accent']} !important;
    font-weight: 600 !important;
    font-size: 0.85rem !important;
    transition: all .2s !important;
}}
.stButton > button:hover {{
    background: {C['accent_brd']} !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px {C['shadow']} !important;
}}
.stButton > button p {{ color: {C['accent']} !important; }}

/* ══ EXPANDER ══ */
.streamlit-expanderHeader, [data-testid="stExpander"] summary {{
    background: {C['expander_bg']} !important;
    border: 1px solid {C['card_brd']} !important;
    border-radius: 12px !important;
    color: {C['text']} !important;
}}
[data-testid="stExpander"] summary p,
[data-testid="stExpander"] summary span {{
    color: {C['text']} !important;
}}
[data-testid="stExpander"] > div {{
    background: {C['expander_bg']} !important;
    border: 1px solid {C['card_brd']} !important;
    border-top: none !important;
}}

/* ══ DATAFRAME ══ */
.stDataFrame {{ border-radius: 12px; overflow: hidden; }}
[data-testid="stDataFrameResizable"] {{
    background: {C['table_bg']} !important;
    color: {C['table_text']} !important;
}}

/* ══ SPINNER ══ */
.stSpinner > div {{ border-top-color: {C['accent']} !important; }}

/* ══ TYPING INDICATOR ══ */
.typing-indicator {{
    display: flex; align-items: center; gap: 5px; padding: 0.5rem;
}}
.typing-indicator span {{
    width: 7px; height: 7px; border-radius: 50%;
    background: {C['accent']}; opacity: 0.7;
    animation: bounce 1.2s infinite;
}}
.typing-indicator span:nth-child(2) {{ animation-delay: .2s; }}
.typing-indicator span:nth-child(3) {{ animation-delay: .4s; }}
@keyframes bounce {{
    0%,80%,100% {{ transform: scale(0.7); opacity:.4; }}
    40% {{ transform: scale(1); opacity:1; }}
}}

/* ══ DIVIDER ══ */
.divider {{
    border: none; border-top: 1px solid {C['divider']};
    margin: 0.8rem 0;
}}

/* ══ FOOTER ══ */
.footer-txt {{
    text-align: center; font-size: .7rem;
    color: {C['text_muted']}; padding: 0.5rem 0 1rem;
}}
</style>
""", unsafe_allow_html=True)

# ── HORLOGE + TOGGLE THEME (JS) ───────────────────────────────────────────────
theme_icon = "☀️" if is_dark else "🌙"
theme_label = "Mode clair" if is_dark else "Mode sombre"


# ── BARRE SUPÉRIEURE : toggle thème ──────────────────────────────────────────
_spacer, _toggle_col = st.columns([10, 1])
with _toggle_col:
    toggle_label = "☀️ Clair" if is_dark else "🌙 Sombre"
    if st.button(toggle_label, key="theme_btn"):
        st.session_state.theme = "light" if is_dark else "dark"
        st.rerun()

# ── SIDEBAR ───────────────────────────────────────────────────────────────────
with st.sidebar:
    # Logo
    st.markdown("""
    <div class="hero" style="padding-top:0.5rem">
        <div class="hero-icon">⚡</div>
        <div class="hero-text">
            <h1>Nutri-IA</h1>
            <p>Coach Nutrition · Llama 3.3</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<hr class="divider" style="margin:0.4rem 0">', unsafe_allow_html=True)

    # Profil
    st.markdown('<div class="sb-section">', unsafe_allow_html=True)
    st.markdown('<div class="sb-label">Profil</div>', unsafe_allow_html=True)
    objectif = st.selectbox("Objectif", ["Perte de gras", "Prise de masse", "Performance", "Maintien"], label_visibility="collapsed")
    poids = st.number_input("Poids (kg)", min_value=40, max_value=200, value=75, step=1)
    nb_repas = st.select_slider("Repas / jour", options=[2, 3, 4, 5, 6], value=3)
    st.markdown('</div>', unsafe_allow_html=True)

    # Reset
    if st.button("↺  Nouvelle conversation", width="stretch"):
        st.session_state.messages = []
        st.rerun()

    st.markdown("<p class='footer-txt'>Gym-IA Engine v3.0 · 2026</p>", unsafe_allow_html=True)

# ── MAIN CONTENT ──────────────────────────────────────────────────────────────

# Message d'accueil dynamique
welcome_msg = (
    f"Bonjour 👋 Je suis **Nutri-IA**, votre coach nutrition IA.\n\n"
    f"Je vois que votre objectif est **{objectif}** avec **{nb_repas} repas** par jour "
    f"pour un poids de **{poids} kg**. Comment puis-je vous aider ?"
)

if "messages" not in st.session_state or len(st.session_state.messages) == 0:
    st.session_state.messages = [{"role": "assistant", "content": welcome_msg}]
else:
    first = st.session_state.messages[0]
    if first["role"] == "assistant" and first["content"].startswith("Bonjour 👋"):
        st.session_state.messages[0]["content"] = welcome_msg

# Affichage historique
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Suggestions rapides — disparaissent dès qu'un message utilisateur existe
SUGGESTIONS = [
    "🥗 Menu perte de gras aujourd'hui",
    "💪 Aliments riches en protéines",
    "⏱ Repas rapide post-entraînement",
    "🧮 Calcule mes macros",
    "🌙 Que manger le soir ?",
]

has_user_msg = any(m["role"] == "user" for m in st.session_state.messages)
if not has_user_msg:
    cols = st.columns(len(SUGGESTIONS))
    for i, sug in enumerate(SUGGESTIONS):
        with cols[i]:
            if st.button(sug, key=f"chip_{i}", width="stretch"):
                user_prompt = sug.split(" ", 1)[1]
                st.session_state.messages.append({"role": "user", "content": user_prompt})
                with st.chat_message("user"):
                    st.markdown(user_prompt)
                with st.chat_message("assistant"):
                    context = f"Objectif: {objectif} | Poids: {poids}kg | Repas/jour: {nb_repas}"
                    enriched = f"{user_prompt}\n\n[Contexte: {context}]"
                    response = st.write_stream(
                        stream_chat_response(enriched, history=st.session_state.messages[:-1])
                    )
                    st.session_state.messages.append({"role": "assistant", "content": response})
                st.rerun()

# Inventaire (hors colonne, avant le chat_input)
st.markdown('<hr class="divider">', unsafe_allow_html=True)
with st.expander("📦  Inventaire — Base locale"):
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(
            "SELECT nom as Aliment, categorie as Catégorie, calories_100g as Kcal, proteines_100g as Protéines, lipides_100g as Lipides, glucides_100g as Glucides FROM ingredients ORDER BY categorie",
            conn
        )
        conn.close()
        st.dataframe(df, width="stretch", hide_index=True)
    except Exception as e:
        st.warning(f"Impossible de charger la base : {e}")

# ── CHAT INPUT — hors de tout conteneur pour rester fixé en bas ───────────────
if prompt := st.chat_input("Posez votre question nutrition…"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    with st.chat_message("assistant"):
        context = f"Objectif: {objectif} | Poids: {poids}kg | Repas/jour: {nb_repas}"
        enriched_prompt = f"{prompt}\n\n[Contexte utilisateur: {context}]"
        response = st.write_stream(
            stream_chat_response(enriched_prompt, history=st.session_state.messages[:-1])
        )
        st.session_state.messages.append({"role": "assistant", "content": response})
