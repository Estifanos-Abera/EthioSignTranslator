"""
Single source of truth for the 15-word EthSL class list.
class_label values MUST match folder/file names exactly everywhere in the project.
"""

CLASSES = [
    {"label": "ene",           "amharic": "እኔ",       "gloss": "I / me",       "two_handed": False},
    {"label": "ante",          "amharic": "አንተ",      "gloss": "you",          "two_handed": False},
    {"label": "felig",         "amharic": "ፈልግ",      "gloss": "want",         "two_handed": True},
    {"label": "erda",          "amharic": "እርዳ",      "gloss": "help",         "two_handed": True},
    {"label": "wided",         "amharic": "ውደድ",      "gloss": "like",         "two_handed": True},
    {"label": "selam",         "amharic": "ሰላም",      "gloss": "hello",        "two_handed": False},
    {"label": "ameseginalehu", "amharic": "አመሰግናለሁ",  "gloss": "thank you",    "two_handed": False},
    {"label": "yikirta",       "amharic": "ይቅርታ",     "gloss": "sorry",        "two_handed": False},
    {"label": "awo",           "amharic": "አዎ",       "gloss": "yes",          "two_handed": False},
    {"label": "ay",            "amharic": "አይ",       "gloss": "no",           "two_handed": False},
    {"label": "ebakih",        "amharic": "እባክህ",     "gloss": "please",       "two_handed": False},
    {"label": "mn",            "amharic": "ምን",       "gloss": "what",         "two_handed": False},
    {"label": "yet",           "amharic": "የት",       "gloss": "where",        "two_handed": False},
    {"label": "sm",            "amharic": "ስም",       "gloss": "name",         "two_handed": True},
    {"label": "wiha",          "amharic": "ውሃ",       "gloss": "water",        "two_handed": False},
]

CLASS_LABELS = [c["label"] for c in CLASSES]

REPS_PER_CLASS = 18
VALID_SIGNER_IDS = ["s1", "s2", "s3", "s4", "s5"]