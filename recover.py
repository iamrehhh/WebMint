import json
import re
import glob

transcript_path = '/Users/abdulrehan/.gemini/antigravity-ide/brain/c5b6c584-dee7-4ccd-9df5-4355bdb4697f/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'VIEW_FILE' and 'index.html' in data.get('content', ''):
                content = data['content']
                if 'Total Lines: 565' in content:
                    lines = content.split('\n')
                    html_lines = []
                    for l in lines:
                        match = re.match(r'^\d+:\s(.*)', l)
                        if match:
                            html_lines.append(match.group(1))
                    if html_lines:
                        with open('/Users/abdulrehan/Downloads/WebMint/index.html', 'w') as out:
                            out.write('\n'.join(html_lines) + '\n')
                        print('Recovered original index.html')
                        break
        except Exception as e:
            pass
