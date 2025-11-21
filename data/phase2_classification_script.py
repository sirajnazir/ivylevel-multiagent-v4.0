#!/usr/bin/env python3
"""
PHASE 2: Classification & Mapping
Maps each file to its recommended canonical location in the v4 architecture
"""

import json
from pathlib import Path
from collections import defaultdict

# Canonical v4 bucket structure
CANONICAL_BUCKETS = {
    'raw': '/coaches/jenny/raw/',
    'kb_chips': '/coaches/jenny/curated/kb_chips/',
    'eq_chips': '/coaches/jenny/curated/eq_chips/',
    'frameworks': '/coaches/jenny/curated/frameworks/',
    'narrative': '/coaches/jenny/curated/narrative/',
    'assessments': '/students/jenny_assessments_v1/',
    'reports': '/reports/',
    'archive': '/archive/'
}

def classify_to_bucket(file_entry):
    """
    Classify each file into ONE canonical v4 bucket
    Returns: (bucket_key, recommended_path, reason)
    """
    path = file_entry['absolute_path']
    filename = file_entry['filename']
    category = file_entry['semantic_category']
    file_type = file_entry['file_type']
    status = file_entry['status']

    path_lower = path.lower()

    # System files -> archive
    if file_type in ['system', 'log'] or filename in ['.DS_Store']:
        return ('archive', f"/archive/system/{filename}", "System/log files to be archived")

    # QA/validation tooling -> archive
    if category == 'tooling/scripts' and any(x in path_lower for x in ['qa_runs', 'validate', 'precision_probe']):
        return ('archive', f"/archive/qa_tools/{filename}", "QA/validation tooling - no longer needed in production")

    # Tooling scripts that are still active
    if file_type == 'py' and '/tools/' in path_lower:
        return ('archive', f"/archive/tools/{filename}", "Extraction/processing scripts - archive after use")

    # RAW source files (PDFs, DOCX, VTT, TXT, JSON transcripts)
    if status == 'RAW' or '/raw/' in path_lower:
        # Huda's raw files
        if '/huda/' in path_lower:
            if '/01-assess-session' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/01_assess_session/', "Huda's raw assessment transcript")
            elif '/02-gameplan-report' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/02_gameplan_reports/', "Huda's raw game plan reports")
            elif '/03-all-sessions' in path_lower or '/03-all-session' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/03_session_transcripts/', "Huda's raw coaching session transcripts")
            elif '/04-execdoc' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/04_exec_docs/', "Huda's raw execution documents")
            elif '/05-imessage' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/05_imessage/', "Huda's raw iMessage transcripts")
            elif '/06-college-application' in path_lower:
                return ('raw', '/coaches/jenny/raw/huda/06_college_apps/', "Huda's college application materials")
            else:
                return ('raw', '/coaches/jenny/raw/huda/misc/', "Huda's other raw materials")
        # Other students' raw files
        elif '/other-students/' in path_lower:
            if 'assess' in path_lower:
                return ('raw', '/coaches/jenny/raw/other_students/assess/', "Other students' assessment transcripts")
            elif 'gameplan' in path_lower:
                return ('raw', '/coaches/jenny/raw/other_students/gameplans/', "Other students' game plan reports")
            else:
                return ('raw', '/coaches/jenny/raw/other_students/misc/', "Other students' raw materials")
        else:
            return ('raw', '/coaches/jenny/raw/misc/', "Miscellaneous raw source files")

    # EQ CHIPS
    if category == 'EQ chip' or '/07-eq-chips/' in path_lower or 'eq_' in filename.lower():
        return ('eq_chips', f"/coaches/jenny/curated/eq_chips/{filename}", "EQ/communication pattern chip")

    # KB CHIPS (intel chips - assess, gameplan, exec, imsg, session)
    if category == 'intel chip (kb/imsg/exec)' or '/06-kb-chips/' in path_lower:
        # Session-level chips
        if 'w0' in filename.lower() and 'chips' in filename.lower():
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/session/{filename}", "Session-level KB intelligence chip")
        # iMessage chips
        elif 'imsg' in path_lower or 'imessage' in filename.lower():
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/imsg/{filename}", "iMessage intelligence chip")
        # Exec chips
        elif 'exec' in filename.lower() or '/exec-chips/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/exec/{filename}", "Execution intelligence chip")
        # Assessment/gameplan chips
        elif 'assess' in path_lower or 'gameplan' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/assess_gameplan/{filename}", "Assessment/GamePlan intelligence chip")
        else:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/misc/{filename}", "General KB intelligence chip")

    # Curated extraction outputs (TRANS-INTEL from sessions)
    if '/extractions/' in path_lower and file_type == 'docx':
        if '/01-assess-session/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/assess_extractions/{filename}", "Curated assessment extraction")
        elif '/02-gameplan-report/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/gameplan_extractions/{filename}", "Curated game plan extraction")
        elif '/03-all-session/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/session_extractions/{filename}", "Curated session intelligence extraction")
        elif '/04-execdoc/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/exec_extractions/{filename}", "Curated execution doc extraction")
        elif '/05-imessage/' in path_lower:
            return ('kb_chips', f"/coaches/jenny/curated/kb_chips/imsg_extractions/{filename}", "Curated iMessage extraction")

    # Frameworks (strategies, tactics, narrative templates)
    if category == 'strategy/tactics document' or 'framework' in filename.lower():
        return ('frameworks', f"/coaches/jenny/curated/frameworks/{filename}", "Strategic framework/tactics document")

    # Narrative templates
    if 'narrative' in filename.lower() or category == 'narrative framework':
        return ('narrative', f"/coaches/jenny/curated/narrative/{filename}", "Narrative template/pattern")

    # Persona/archetype data
    if category == 'persona/archetype data' or '/personas/jenny/' in path_lower:
        if 'archetype' in filename.lower():
            return ('narrative', f"/coaches/jenny/curated/narrative/archetypes/{filename}", "Archetype mapping data")
        elif 'eq_patterns' in filename.lower() or 'coaching_patterns' in filename.lower():
            return ('eq_chips', f"/coaches/jenny/curated/eq_chips/patterns/{filename}", "EQ/coaching pattern data")
        elif 'heuristics' in filename.lower() or 'golden_thread' in filename.lower():
            return ('frameworks', f"/coaches/jenny/curated/frameworks/persona/{filename}", "Jenny persona framework data")
        else:
            return ('narrative', f"/coaches/jenny/curated/narrative/persona/{filename}", "Persona configuration data")

    # Student assessment outputs (structured data)
    if '/students/jenny_assessments_v1/' in path_lower or 'student_' in filename.lower():
        return ('assessments', f"/students/jenny_assessments_v1/{filename}", "Student assessment structured output")

    # Assessment transcripts from other students (extractions)
    if '/other-students/' in path_lower and '/01-assess-session/' in path_lower:
        return ('assessments', f"/students/jenny_assessments_v1/extractions/{filename}", "Assessment extraction from other student")

    # Reports (PDFs, game plan reports)
    if category == 'game plan report' and file_type == 'pdf':
        return ('reports', f"/reports/{filename}", "Published game plan report PDF")

    # College application materials
    if category == 'college application files':
        return ('archive', f"/archive/college_apps/{filename}", "College application materials (reference only)")

    # Miscellaneous - needs manual review
    return ('archive', f"/archive/misc/{filename}", "Miscellaneous - requires manual classification")

def main():
    """Execute Phase 2 classification"""
    print("🗂️  Starting PHASE 2: Classification & Mapping...")
    print("=" * 80)

    # Load Phase 1 inventory
    with open('/Users/snazir/ivylevel-multiagents-v4.0/data/PHASE1_FILE_INVENTORY.json', 'r') as f:
        phase1_data = json.load(f)

    inventory = phase1_data['file_inventory']

    # Classify each file
    mappings = []
    bucket_stats = defaultdict(int)

    for file_entry in inventory:
        bucket_key, recommended_path, reason = classify_to_bucket(file_entry)

        mapping = {
            'source_path': file_entry['absolute_path'],
            'filename': file_entry['filename'],
            'file_type': file_entry['file_type'],
            'semantic_category': file_entry['semantic_category'],
            'current_status': file_entry['status'],
            'is_duplicate': file_entry['is_duplicate'],
            'recommended_bucket': bucket_key,
            'recommended_target': recommended_path,
            'reason': reason
        }

        mappings.append(mapping)
        bucket_stats[bucket_key] += 1

    # Sort by bucket
    mappings_sorted = sorted(mappings, key=lambda x: (x['recommended_bucket'], x['recommended_target']))

    # Generate output
    output = {
        'phase': 'PHASE 2 - CLASSIFICATION & MAPPING',
        'v4_canonical_buckets': CANONICAL_BUCKETS,
        'summary': {
            'total_files_classified': len(mappings),
            'by_bucket': dict(bucket_stats)
        },
        'file_mappings': mappings_sorted
    }

    # Write to file
    output_path = '/Users/snazir/ivylevel-multiagents-v4.0/data/PHASE2_FILE_MAPPING.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"✅ Classification complete!")
    print(f"📄 Mapping written to: {output_path}")

    print("\n📊 Files by Canonical Bucket:")
    print("-" * 80)
    for bucket, count in sorted(bucket_stats.items(), key=lambda x: -x[1]):
        print(f"  {bucket:20s}: {count:4d} files")

    # Show sample mappings
    print("\n📋 Sample Mappings (first 10):")
    print("-" * 80)
    for i, mapping in enumerate(mappings_sorted[:10]):
        print(f"\n  [{i+1}] {mapping['filename']}")
        print(f"      Current:  {mapping['source_path']}")
        print(f"      Target:   {mapping['recommended_target']}")
        print(f"      Reason:   {mapping['reason']}")

if __name__ == "__main__":
    main()
