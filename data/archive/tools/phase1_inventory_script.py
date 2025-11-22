#!/usr/bin/env python3
"""
PHASE 1: Full Directory + File Inventory Scanner
Recursively scans target directories and creates comprehensive file inventory
"""

import os
import json
import hashlib
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Target directories
TARGET_DIRS = [
    "/Users/snazir/ivylevel-multiagents-v4.0/data/coaches/jenny",
    "/Users/snazir/ivylevel-multiagents-v4.0/data/students",
    "/Users/snazir/ivylevel-multiagents-v4.0/data/raw",
    "/Users/snazir/ivylevel-multiagents-v4.0/data/reports",
    "/Users/snazir/ivylevel-multiagents-v4.0/data/personas/jenny"
]

def get_file_hash(filepath, chunk_size=8192):
    """Generate MD5 hash for duplicate detection"""
    try:
        hasher = hashlib.md5()
        with open(filepath, 'rb') as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest()
    except:
        return None

def get_file_type(filepath):
    """Detect file type from extension"""
    ext = Path(filepath).suffix.lower()
    type_map = {
        '.pdf': 'pdf',
        '.docx': 'docx',
        '.doc': 'doc',
        '.txt': 'txt',
        '.json': 'json',
        '.jsonl': 'jsonl',
        '.csv': 'csv',
        '.xlsx': 'xlsx',
        '.xls': 'xls',
        '.vtt': 'vtt',
        '.md': 'md',
        '.py': 'py',
        '.log': 'log',
        '.DS_Store': 'system'
    }
    return type_map.get(ext, ext[1:] if ext else 'unknown')

def classify_file_status(filepath):
    """Classify if file is RAW, CURATED, or UNKNOWN"""
    path_lower = filepath.lower()

    if '/raw/' in path_lower:
        return 'RAW'
    elif any(x in path_lower for x in ['/curated/', '/extractions/', '/chips/', '/eq-chips/']):
        return 'CURATED'
    else:
        return 'UNKNOWN'

def classify_semantic_category(filepath, filename):
    """Classify file's semantic category"""
    path_lower = filepath.lower()
    filename_lower = filename.lower()

    # Check path patterns
    if '/01-assess-session' in path_lower or 'assessment' in filename_lower:
        return 'assessment transcript'
    elif '/02-gameplan-report' in path_lower or 'gameplan' in filename_lower:
        return 'game plan report'
    elif '/03-all-session' in path_lower or 'trans-intel' in filename_lower or 'trans-raw' in filename_lower:
        return 'full-session coaching transcript'
    elif '/04-execdoc' in path_lower or 'exec-intel' in filename_lower or 'exec-raw' in filename_lower:
        return 'weekly execution docs'
    elif '/05-imessage' in path_lower or 'imsg' in filename_lower or 'imessage' in filename_lower:
        return 'iMessage history'
    elif '/06-kb-chips' in path_lower or 'intel_chips' in filename_lower or 'kb_' in filename_lower:
        return 'intel chip (kb/imsg/exec)'
    elif '/07-eq-chips' in path_lower or 'eq_' in filename_lower:
        return 'EQ chip'
    elif '/06-college-application' in path_lower or 'common app' in filename_lower:
        return 'college application files'
    elif 'framework' in filename_lower or '/frameworks/' in path_lower:
        return 'narrative framework'
    elif 'strategy' in filename_lower or 'tactics' in filename_lower:
        return 'strategy/tactics document'
    elif 'persona' in path_lower or 'archetype' in filename_lower:
        return 'persona/archetype data'
    elif filename.endswith('.py') or filename.endswith('.log'):
        return 'tooling/scripts'
    elif 'precision_probe' in filename_lower or 'validation' in filename_lower:
        return 'QA/validation files'
    elif filename == '.DS_Store':
        return 'system files'
    else:
        return 'miscellaneous'

def format_size(size_bytes):
    """Format file size in KB/MB"""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f}KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f}MB"

def scan_directories():
    """Main scanning function"""
    print("🔍 Starting PHASE 1: Full Directory + File Inventory Scan...")
    print("=" * 80)

    inventory = []
    hash_map = defaultdict(list)  # For duplicate detection
    stats = {
        'total_files': 0,
        'total_size': 0,
        'by_type': defaultdict(int),
        'by_status': defaultdict(int),
        'by_category': defaultdict(int),
        'duplicates': 0
    }

    for target_dir in TARGET_DIRS:
        if not os.path.exists(target_dir):
            print(f"⚠️  Directory not found: {target_dir}")
            continue

        print(f"\n📂 Scanning: {target_dir}")

        for root, dirs, files in os.walk(target_dir):
            for filename in files:
                filepath = os.path.join(root, filename)

                try:
                    # Get file stats
                    file_stat = os.stat(filepath)
                    file_size = file_stat.st_size

                    # Skip empty files
                    if file_size == 0:
                        continue

                    # Classify file
                    file_type = get_file_type(filepath)
                    file_status = classify_file_status(filepath)
                    semantic_category = classify_semantic_category(filepath, filename)

                    # Get hash for duplicate detection (only for non-system files)
                    file_hash = None
                    is_duplicate = False
                    duplicate_of = None

                    if file_type not in ['system', 'log'] and file_size > 100:
                        file_hash = get_file_hash(filepath)
                        if file_hash:
                            if file_hash in hash_map:
                                is_duplicate = True
                                duplicate_of = hash_map[file_hash][0]['absolute_path']
                                stats['duplicates'] += 1
                            hash_map[file_hash].append({'absolute_path': filepath})

                    # Build inventory entry
                    entry = {
                        'absolute_path': filepath,
                        'filename': filename,
                        'file_type': file_type,
                        'size_bytes': file_size,
                        'size_formatted': format_size(file_size),
                        'status': file_status,
                        'semantic_category': semantic_category,
                        'is_duplicate': is_duplicate,
                        'duplicate_of': duplicate_of,
                        'file_hash': file_hash
                    }

                    inventory.append(entry)

                    # Update stats
                    stats['total_files'] += 1
                    stats['total_size'] += file_size
                    stats['by_type'][file_type] += 1
                    stats['by_status'][file_status] += 1
                    stats['by_category'][semantic_category] += 1

                except Exception as e:
                    print(f"❌ Error processing {filepath}: {e}")

    print("\n" + "=" * 80)
    print("✅ Scan complete!")
    print(f"📊 Total files: {stats['total_files']}")
    print(f"💾 Total size: {format_size(stats['total_size'])}")
    print(f"🔄 Duplicates found: {stats['duplicates']}")

    return inventory, stats, hash_map

def main():
    """Execute full scan and generate output"""
    inventory, stats, hash_map = scan_directories()

    # Generate output
    output = {
        'scan_timestamp': datetime.now().isoformat(),
        'phase': 'PHASE 1 - FULL DIRECTORY + FILE INVENTORY',
        'summary_stats': {
            'total_files': stats['total_files'],
            'total_size_bytes': stats['total_size'],
            'total_size_formatted': format_size(stats['total_size']),
            'duplicates_found': stats['duplicates'],
            'by_file_type': dict(stats['by_type']),
            'by_status': dict(stats['by_status']),
            'by_semantic_category': dict(stats['by_category'])
        },
        'file_inventory': sorted(inventory, key=lambda x: x['absolute_path'])
    }

    # Write to file
    output_path = '/Users/snazir/ivylevel-multiagents-v4.0/data/PHASE1_FILE_INVENTORY.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n📄 Inventory written to: {output_path}")

    # Print summary by category
    print("\n📋 Files by Semantic Category:")
    print("-" * 80)
    for category, count in sorted(stats['by_category'].items(), key=lambda x: -x[1]):
        print(f"  {category:40s}: {count:4d} files")

    print("\n📋 Files by Type:")
    print("-" * 80)
    for ftype, count in sorted(stats['by_type'].items(), key=lambda x: -x[1]):
        print(f"  {ftype:20s}: {count:4d} files")

    print("\n📋 Files by Status:")
    print("-" * 80)
    for status, count in sorted(stats['by_status'].items(), key=lambda x: -x[1]):
        print(f"  {status:20s}: {count:4d} files")

if __name__ == "__main__":
    main()
