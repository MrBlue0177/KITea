#!/usr/bin/env python3
import re
import json

# Read the PDF text
with open('/tmp/devin-overflows-1000/8d003146/content.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Split by lines
lines = text.split('\n')

modules = []
current_module = None
lines_since_id = 0

for i, line in enumerate(lines):
    line = line.strip()
    
    # Check if line is a 7-digit module ID
    if re.match(r'^\d{7}$', line):
        # Save previous module if exists and has valid data
        if current_module and current_module.get('moduleName') and len(current_module['moduleName']) > 5:
            modules.append(current_module)
        
        # Start new module
        current_module = {
            'moduleNumber': line,
            'moduleName': None,
            'language': None,
            'sws': None,
            'type': None
        }
        lines_since_id = 0
    elif current_module:
        lines_since_id += 1
        
        # Extract module information based on position and content
        if lines_since_id == 1:
            # First line after ID is typically SWS
            if re.match(r'^\d+\s+SWS$', line):
                current_module['sws'] = line
        elif lines_since_id in [2, 3]:
            # Lines 2-3 are typically language parts (German/ English)
            if line in ['German', 'English', 'German/English'] or line.endswith('/'):
                if not current_module['language']:
                    current_module['language'] = line
                elif current_module['language'].endswith('/'):
                    current_module['language'] += ' ' + line
        elif not current_module['moduleName']:
            # The first substantial line after language is the module name
            if line and line not in ['German', 'English', 'German/English'] and not re.match(r'^\d+\s+SWS$', line) and not line.endswith('/'):
                if len(line) > 5 and len(line) < 300 and not line.startswith('🗣'):
                    current_module['moduleName'] = line
        elif line in ['Lecture (V)', 'Practice (Ü)', 'Lecture / Practice (VÜ)', 'Seminar (S)', 'Project (P)'] and not current_module['type']:
            current_module['type'] = line

# Don't forget the last module
if current_module and current_module.get('moduleName') and len(current_module['moduleName']) > 5:
    modules.append(current_module)

# Remove duplicates based on moduleNumber
seen_numbers = set()
unique_modules = []
for module in modules:
    if module['moduleNumber'] not in seen_numbers:
        seen_numbers.add(module['moduleNumber'])
        unique_modules.append(module)

print(f"Found {len(unique_modules)} unique modules with valid data")

# Write to JSON file
with open('/tmp/winter_modules.json', 'w', encoding='utf-8') as f:
    json.dump(unique_modules, f, indent=2, ensure_ascii=False)

print("Module data written to /tmp/winter_modules.json")

# Print sample modules
print("\nSample modules:")
for i, module in enumerate(unique_modules[:15]):
    print(f"\n{i+1}. {module['moduleNumber']} - {module['moduleName']}")
    print(f"   Language: {module.get('language')}, SWS: {module.get('sws')}, Type: {module.get('type')}")