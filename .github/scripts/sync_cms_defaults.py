import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent.parent
prefs = json.loads((root / "content/preferences.json").read_text())
config_path = root / "public/admin/config.yml"
config = config_path.read_text()

field_map = {
    "sets": prefs.get("defaultSets"),
    "reps": prefs.get("defaultReps"),
}

for name, value in field_map.items():
    if value is None:
        continue
    config = re.sub(
        rf"(name: {name}, .+?)(?:, default: \d+)?(\s*\}})",
        rf"\1, default: {value}\2",
        config,
    )

config_path.write_text(config)
print(f"Synced CMS defaults: sets={field_map['sets']}, reps={field_map['reps']}")
