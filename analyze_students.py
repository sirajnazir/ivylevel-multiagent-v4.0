import os
import json
import hashlib
from datetime import datetime

def get_file_info(filepath):
    try:
        stat = os.stat(filepath)
        mtime = datetime.fromtimestamp(stat.st_mtime)
        with open(filepath, 'r') as f:
            content = f.read()
            data = json.loads(content)
            
        file_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        
        # Check schema
        has_profile = 'profile' in data
        has_diagnostics = 'diagnostics' in data
        has_recommendations = 'recommendations' in data
        is_v4 = has_profile and has_diagnostics and has_recommendations
        
        student_id = data.get('student_id')
        student_name = data.get('student_name')
        
        return {
            'path': filepath,
            'mtime': mtime,
            'hash': file_hash,
            'is_v4': is_v4,
            'student_id': student_id,
            'student_name': student_name,
            'size': stat.st_size
        }
    except Exception as e:
        return {
            'path': filepath,
            'error': str(e)
        }

files = [
    "data/students/jenny_assessments_v1/student_011_beya_structured.json",
    "data/students/jenny_assessments_v1/student_006_arshiya_structured.json",
    "data/students/jenny_assessments_v1/student_005_srinidhi_structured.json",
    "data/students/jenny_assessments_v1/student_003_aaryan_structured.json",
    "data/students/jenny_assessments_v1/student_007_aarnav_structured.json",
    "data/students/jenny_assessments_v1/student_009_aarav_structured.json",
    "data/students/jenny_assessments_v1/student_010_zainab_structured.json",
    "data/students/jenny_assessments_v1/student_002_ananyaa_structured.json",
    "data/students/jenny_assessments_v1/student_008_iqra_structured.json",
    "data/students/jenny_assessments_v1/student_004_hiba_structured.json",
    "data/students/jenny_assessments_v1/student_001_anoushka_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_009_aarav_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_004_hiba_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_011_beya_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_006_arshiya_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_006_arshiya_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_005_srinidhi_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_005_srinidhi_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_000_huda_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_001_anoushka_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_011_beya_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_003_aaryan_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_007_aarnav_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_009_aarav_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_007_aarnav_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_010_zainab_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_010_zainab_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_002_ananyaa_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_008_iqra_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_002_ananyaa_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_003_aaryan_structured_1.json",
    "data/v4_organized/students/jenny_assessments_v1/student_004_hiba_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_001_anoushka_structured.json",
    "data/v4_organized/students/jenny_assessments_v1/student_008_iqra_structured_1.json"
]

info_list = [get_file_info(f) for f in files]

# Group by student_id
students = {}
no_id = []

for info in info_list:
    if 'error' in info:
        no_id.append(info)
        continue
        
    sid = info.get('student_id')
    if not sid:
        # Try to infer from filename
        basename = os.path.basename(info['path'])
        if 'student_' in basename:
            parts = basename.split('_')
            if len(parts) >= 2:
                sid = f"{parts[0]}_{parts[1]}" # e.g. student_001
        
    if sid:
        if sid not in students:
            students[sid] = []
        students[sid].append(info)
    else:
        no_id.append(info)

print("# CANONICAL MAPPING TABLE")
print(f"Generated at: {datetime.now()}")
print("")

for sid in sorted(students.keys()):
    print(f"## Student: {sid}")
    items = students[sid]
    
    # Find newest
    newest = max(items, key=lambda x: x['mtime'])
    
    print("| File Path | Size | V4 Schema | MTime | Duplicate? | Recommendation |")
    print("|---|---|---|---|---|---|")
    
    # Check for duplicates
    hashes = [x['hash'] for x in items]
    
    for item in items:
        is_newest = item == newest
        is_dup = hashes.count(item['hash']) > 1
        
        rec = ""
        if "v4_organized" in item['path'] and not "_1.json" in item['path']:
             rec = "**CANONICAL** (data/students/jenny_assessments_v1/)"
        elif "_1.json" in item['path']:
             rec = "ARCHIVE (data/archive/legacy_v3/duplicates/)"
        elif "data/students" in item['path']:
             rec = "ARCHIVE (data/archive/legacy_v3/students_backup/)"
        else:
             rec = "REVIEW"
             
        print(f"| `{item['path']}` | {item['size']} | {item['is_v4']} | {item['mtime']} | {is_dup} | {rec} |")
    print("")

if no_id:
    print("## Files with NO Student ID")
    for item in no_id:
        print(f"- {item['path']} (Error: {item.get('error', 'Missing ID')})")
