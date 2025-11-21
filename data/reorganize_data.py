#!/usr/bin/env python3
"""
Data Reorganization Script - IvyLevel v4.0
Safely reorganizes files according to PHASE2_FILE_MAPPING.json
"""

import os
import json
import shutil
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Base paths
BASE_DATA_DIR = Path("/Users/snazir/ivylevel-multiagents-v4.0/data")
NEW_STRUCTURE_ROOT = BASE_DATA_DIR / "v4_organized"

# Load the mapping
MAPPING_FILE = BASE_DATA_DIR / "PHASE2_FILE_MAPPING.json"

def create_new_structure():
    """Create the new v4 directory structure"""
    print("📁 Creating new v4 directory structure...")

    dirs_to_create = [
        # Coaches/Jenny structure
        "coaches/jenny/raw/huda/01_assess_session",
        "coaches/jenny/raw/huda/02_gameplan_reports",
        "coaches/jenny/raw/huda/03_session_transcripts",
        "coaches/jenny/raw/huda/04_exec_docs",
        "coaches/jenny/raw/huda/05_imessage",
        "coaches/jenny/raw/huda/06_college_apps",
        "coaches/jenny/raw/huda/misc",
        "coaches/jenny/raw/other_students/assess",
        "coaches/jenny/raw/other_students/gameplans",
        "coaches/jenny/raw/other_students/misc",
        "coaches/jenny/raw/misc",

        # Curated KB chips
        "coaches/jenny/curated/kb_chips/session",
        "coaches/jenny/curated/kb_chips/imsg",
        "coaches/jenny/curated/kb_chips/exec",
        "coaches/jenny/curated/kb_chips/assess_gameplan",
        "coaches/jenny/curated/kb_chips/session_extractions",
        "coaches/jenny/curated/kb_chips/gameplan_extractions",
        "coaches/jenny/curated/kb_chips/imsg_extractions",
        "coaches/jenny/curated/kb_chips/exec_extractions",
        "coaches/jenny/curated/kb_chips/misc",

        # EQ chips
        "coaches/jenny/curated/eq_chips/sessions",
        "coaches/jenny/curated/eq_chips/imsg",
        "coaches/jenny/curated/eq_chips/patterns",

        # Frameworks
        "coaches/jenny/curated/frameworks/strategic",
        "coaches/jenny/curated/frameworks/tactical",
        "coaches/jenny/curated/frameworks/persona",

        # Narrative
        "coaches/jenny/curated/narrative/archetypes",
        "coaches/jenny/curated/narrative/templates",
        "coaches/jenny/curated/narrative/persona",

        # Students
        "students/jenny_assessments_v1",
        "students/jenny_assessments_v1/extractions",

        # Reports
        "reports",

        # Archive
        "archive/system",
        "archive/qa_tools",
        "archive/tools",
        "archive/college_apps",
        "archive/misc"
    ]

    for dir_path in dirs_to_create:
        full_path = NEW_STRUCTURE_ROOT / dir_path
        full_path.mkdir(parents=True, exist_ok=True)

    print(f"✅ Created {len(dirs_to_create)} directories")

def copy_file_to_new_location(source_path, recommended_target):
    """Copy a file to its new location"""
    source = Path(source_path)

    # Handle the recommended_target path
    # Remove leading slash if present
    target_rel = recommended_target.lstrip('/')
    target = NEW_STRUCTURE_ROOT / target_rel

    # Ensure target directory exists
    target.parent.mkdir(parents=True, exist_ok=True)

    # Handle duplicate filenames by appending counter
    if target.exists():
        counter = 1
        stem = target.stem
        suffix = target.suffix
        while target.exists():
            target = target.parent / f"{stem}_{counter}{suffix}"
            counter += 1

    # Copy the file
    try:
        shutil.copy2(source, target)
        return True, str(target)
    except Exception as e:
        return False, str(e)

def reorganize_files():
    """Main reorganization function"""
    print("🔄 Starting file reorganization...")
    print("=" * 80)

    # Load mapping
    with open(MAPPING_FILE, 'r') as f:
        mapping_data = json.load(f)

    mappings = mapping_data['file_mappings']

    stats = {
        'total': len(mappings),
        'success': 0,
        'failed': 0,
        'skipped': 0,
        'by_bucket': defaultdict(int)
    }

    errors = []

    for i, mapping in enumerate(mappings, 1):
        source_path = mapping['source_path']
        recommended_target = mapping['recommended_target']
        bucket = mapping['recommended_bucket']
        filename = mapping['filename']

        # Progress indicator
        if i % 50 == 0:
            print(f"  Progress: {i}/{stats['total']} files...")

        # Check if source exists
        if not Path(source_path).exists():
            stats['skipped'] += 1
            continue

        # Copy file
        success, result = copy_file_to_new_location(source_path, recommended_target)

        if success:
            stats['success'] += 1
            stats['by_bucket'][bucket] += 1
        else:
            stats['failed'] += 1
            errors.append({
                'file': filename,
                'source': source_path,
                'target': recommended_target,
                'error': result
            })

    return stats, errors

def generate_report(stats, errors):
    """Generate final reorganization report"""
    report = {
        'reorganization_timestamp': datetime.now().isoformat(),
        'backup_location': '/Users/snazir/ivylevel-multiagents-v4.0/data_backup_20251119.tar.gz',
        'new_structure_location': str(NEW_STRUCTURE_ROOT),
        'statistics': {
            'total_files': stats['total'],
            'successfully_copied': stats['success'],
            'failed': stats['failed'],
            'skipped': stats['skipped'],
            'by_bucket': dict(stats['by_bucket'])
        },
        'errors': errors
    }

    # Write report
    report_path = BASE_DATA_DIR / 'REORGANIZATION_REPORT.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    return report_path

def main():
    """Execute reorganization"""
    print("🚀 IvyLevel v4.0 Data Reorganization")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backup: data_backup_20251119.tar.gz (36 MB)")
    print(f"New structure: {NEW_STRUCTURE_ROOT}")
    print("=" * 80)
    print()

    # Step 1: Create new structure
    create_new_structure()
    print()

    # Step 2: Reorganize files
    stats, errors = reorganize_files()
    print()

    # Step 3: Generate report
    print("📊 Generating final report...")
    report_path = generate_report(stats, errors)

    print("=" * 80)
    print("✅ REORGANIZATION COMPLETE!")
    print("=" * 80)
    print(f"\n📈 Statistics:")
    print(f"   Total files: {stats['total']}")
    print(f"   ✅ Successfully copied: {stats['success']}")
    print(f"   ❌ Failed: {stats['failed']}")
    print(f"   ⏭️  Skipped: {stats['skipped']}")

    print(f"\n📊 Files by Bucket:")
    for bucket, count in sorted(stats['by_bucket'].items(), key=lambda x: -x[1]):
        print(f"   {bucket:20s}: {count:4d} files")

    if errors:
        print(f"\n⚠️  {len(errors)} errors occurred. See report for details.")

    print(f"\n📄 Full report: {report_path}")
    print(f"📁 New structure: {NEW_STRUCTURE_ROOT}")
    print(f"💾 Backup: data_backup_20251119.tar.gz")
    print()
    print("🎯 Next steps:")
    print("   1. Review the new structure in v4_organized/")
    print("   2. Validate file integrity")
    print("   3. Update code paths if needed")
    print("   4. Delete old structure when confident")
    print()

if __name__ == "__main__":
    main()
