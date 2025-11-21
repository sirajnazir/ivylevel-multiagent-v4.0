#!/usr/bin/env python3
"""
Pinecone Index Information Script
Gets describe and stats for jenny-v3-3072-093025 index
"""

import os
import pinecone

# Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
INDEX_NAME = "jenny-v3-3072-093025"

def get_index_info():
    """Get Pinecone index description and stats"""

    print("🔍 Pinecone Index Information")
    print("=" * 80)
    print(f"Index: {INDEX_NAME}")
    print("=" * 80)
    print()

    try:
        # Initialize Pinecone (v2.x syntax)
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)

        # Get index description
        print("📊 INDEX DESCRIPTION")
        print("-" * 80)

        index_description = pinecone.describe_index(INDEX_NAME)

        # Print description (v2.x returns dict)
        for key, value in index_description.items():
            print(f"{key}: {value}")

        print()

        # Get index stats
        print("📈 INDEX STATS")
        print("-" * 80)

        index = pinecone.Index(INDEX_NAME)
        stats = index.describe_index_stats()

        # Handle stats (v2.x returns dict)
        if isinstance(stats, dict):
            total_vectors = stats.get('total_vector_count', stats.get('totalVectorCount', 0))
            dimension = stats.get('dimension', 'N/A')

            print(f"Total Vector Count: {total_vectors:,}")
            print(f"Dimension: {dimension}")

            namespaces = stats.get('namespaces', {})
            if namespaces:
                print(f"\nNamespaces: {len(namespaces)}")
                print("\nNamespace Breakdown:")
                print("-" * 80)

                for namespace, data in namespaces.items():
                    ns_name = namespace if namespace else "(default/empty)"
                    vector_count = data.get('vectorCount', data.get('vector_count', 0))
                    print(f"  {ns_name:40s}: {vector_count:>10,} vectors")
            else:
                print("\nNo namespace data available")
        else:
            # Fallback for object response
            print(f"Total Vector Count: {getattr(stats, 'total_vector_count', 0):,}")
            print(f"Dimension: {getattr(stats, 'dimension', 'N/A')}")

        print()
        print("=" * 80)
        print("✅ Index information retrieved successfully")
        print("=" * 80)

        return {
            'description': index_description,
            'stats': stats
        }

    except Exception as e:
        print()
        print("=" * 80)
        print("❌ ERROR")
        print("=" * 80)
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("  1. Check PINECONE_API_KEY is set correctly")
        print("  2. Verify index name is correct")
        print("  3. Ensure you have access to this index")
        print()
        return None

if __name__ == "__main__":
    get_index_info()
