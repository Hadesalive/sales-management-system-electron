#!/usr/bin/env python3
import re
import sys

def fix_applayout(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove <AppLayout> opening tags
    content = re.sub(r'<AppLayout>\s*\n\s*', '', content)
    
    # Remove </AppLayout> closing tags at the end before return statement closing
    content = re.sub(r'\s*</AppLayout>\s*\n\s*\);', '\n  );', content)
    
    # Also handle cases where </AppLayout> is on same line as closing div
    content = re.sub(r'</div>\s*\n\s*</AppLayout>', '</div>', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")

if __name__ == "__main__":
    for filepath in sys.argv[1:]:
        fix_applayout(filepath)

