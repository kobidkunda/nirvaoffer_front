import os

# --- Configuration ---

OUTPUT_FILENAME = 'logihaul_source_code.txt'

PROJECTS = [
    {
        'name': 'Laravel Backend',
        'root_dir': '.',
        'check_file': 'artisan',
        'skipped_paths': {
            'vendor', 'node_modules', 'storage', '.git', 'public/build', 
            'bootstrap/cache', '.idea', '.vscode'
        },
        'included_extensions': {
            '.php', '.yml', '.conf', '.md', '.json', '.xml', '.blade.php'
        },
        'included_filenames': {'Dockerfile', 'artisan'},
        'skipped_files': {
            '.env', 'composer.lock', 'package-lock.json', 'generate_source_file.py'
        },
    },
    {
        'name': 'Vue Frontend',
        'root_dir': '/home/biolastic/offer/offerfront/nirva-loyalty-pwa/',
        'check_file': 'vite.config.js',
        'skipped_paths': {
            'node_modules', 'dist', '.git', '.idea', '.vscode'
        },
        'included_extensions': {
            '.vue', '.js', '.ts', '.css', '.html', '.json'
        },
        'included_filenames': {},
        'skipped_files': {
            'package-lock.json', 'composer.lock', '.env', '.env.local'
        },
    }
]

# --- Main Logic ---

def generate_source_file(projects, output_filename):
    """
    Walks through defined projects, finds all relevant source files, sorts them,
    and writes their path and content into a single output text file.
    """
    print("Starting project scan...")
    all_file_paths = []

    for project in projects:
        project_name = project['name']
        root_dir = project['root_dir']
        check_file = os.path.join(root_dir, project['check_file'])

        print(f"\nProcessing Project: {project_name} in '{root_dir}'...")

        if not os.path.exists(root_dir) or not os.path.exists(check_file):
            print(f"Warning: Project '{project_name}' not found at '{root_dir}'. Skipping.")
            continue

        project_file_count = 0
        for dirpath, dirnames, filenames in os.walk(root_dir, topdown=True):
            # --- THIS IS THE CRITICAL FIX ---
            # Prune the list of directories to visit in-place.
            # This prevents os.walk from ever descending into them.
            dirnames[:] = [d for d in dirnames if d not in project['skipped_paths']]

            for filename in filenames:
                if filename in project['skipped_files']:
                    continue

                _, file_ext = os.path.splitext(filename)
                if filename.endswith('.blade.php'):
                    file_ext = '.blade.php'
                
                if filename in project.get('included_filenames', {}) or file_ext in project.get('included_extensions', {}):
                    full_path = os.path.join(dirpath, filename)
                    all_file_paths.append((full_path, project_name))
                    project_file_count += 1
        
        print(f"Found {project_file_count} relevant files in '{project_name}'.")

    all_file_paths.sort()
    print(f"\nTotal relevant files found across all projects: {len(all_file_paths)}")

    try:
        with open(output_filename, 'w', encoding='utf-8') as outfile:
            current_project_name = None
            for file_path, project_name in all_file_paths:
                if project_name != current_project_name:
                    if current_project_name is not None:
                        outfile.write("\n\n")
                    outfile.write(f"# === START OF PROJECT: {project_name.upper()} ===\n\n")
                    current_project_name = project_name
                
                project_root = next(p['root_dir'] for p in projects if p['name'] == project_name)
                relative_path = os.path.relpath(file_path, project_root).replace(os.sep, '/')

                outfile.write(relative_path + '\n')
                outfile.write("{code}\n")
                
                content = ""
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                        outfile.write(content)
                except Exception as e:
                    outfile.write(f"// Error reading file: {e}\n")
                
                if content and not content.endswith('\n'):
                    outfile.write('\n')

                outfile.write("{/code}\n")
                outfile.write("\n" + "="*80 + "\n\n")

        print(f"\nSuccess! All project source code has been written to '{output_filename}'")

    except IOError as e:
        print(f"\nError: Could not write to file '{output_filename}'. Reason: {e}")

if __name__ == "__main__":
    generate_source_file(PROJECTS, OUTPUT_FILENAME)