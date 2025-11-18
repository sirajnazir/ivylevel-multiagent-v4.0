#!/bin/bash
echo "🔍 Running IvyLevel v4 Guardrail Checks..."

# 1. Forbidden folders
for forbidden in new tmp runtime2 sandbox playground experiments draft backup; do
  if [ -d "$forbidden" ]; then
    echo "❌ Forbidden folder detected: $forbidden"
    exit 1
  fi
done

# 2. Duplicate filenames
DUPES=$(find . -type f | sed 's!.*/!!' | sort | uniq -d)
if [ ! -z "$DUPES" ]; then
  echo "❌ Duplicate file names detected:"
  echo "$DUPES"
  exit 1
fi

# 3. Schema enforcement
if find ./apps ./packages -name "*schema*.ts" ! -path "./packages/schema/*" | grep -q .; then
  echo "❌ Schemas found outside /packages/schema"
  exit 1
fi

# 4. Port misuse
if grep -R "port=[1-9][0-9][0-9][0-9]" -n . | grep -v -E "3000|4000|5050|6060|7070|9090"; then
  echo "❌ Unauthorized port usage detected"
  exit 1
fi

echo "✅ Guardrails passed"
