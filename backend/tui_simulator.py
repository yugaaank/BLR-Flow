import sys
import os
import json
import time
import math
import random
from datetime import datetime

# Add src to pythonpath so we can import config
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from config import config, load_models
import pandas as pd

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich import print as rprint

console = Console()

def find_closest_junction(lat, lon):
    closest = None
    min_dist = float('inf')
    for node in config.network_graph['nodes']:
        dist = math.sqrt((lat - node['latitude'])**2 + (lon - node['longitude'])**2)
        if dist < min_dist:
            min_dist = dist
            closest = node['name']
    return closest

def run_tui():
    load_models()
    console.clear()
    console.print(Panel.fit("[bold cyan]BLR-Flow Predictive Model TUI[/bold cyan]\nMinimal Multi-Event Simulation Debugger", border_style="cyan"))
    
    unseen_path = os.path.join(os.path.dirname(__file__), "src", "unseen_data.json")
    if not os.path.exists(unseen_path):
        console.print(f"[red]Error: {unseen_path} not found![/red]")
        return
        
    with open(unseen_path, "r") as f:
        all_events = json.load(f)
        
    n_str = Prompt.ask("\n[bold yellow]Enter number of random violations to simulate (N)[/bold yellow]", default="5")
    try:
        n_sim = int(n_str)
    except ValueError:
        n_sim = 5
        
    events = random.sample(all_events, min(n_sim, len(all_events)))
    
    console.print(f"\n[green]Initializing minimal simulation for {len(events)} events...[/green]\n")
    time.sleep(1)
    
    # Global tracking
    global_infected_nodes = {}
    prevented_count = 0
    missed_count = 0
    run_all = False
    
    for i, event in enumerate(events):
        violation_type_raw = event.get('violation_type', '')
        clean_type = violation_type_raw.replace('[', '').replace(']', '').replace('"', '')
        lat = event['latitude']
        lon = event['longitude']
        hour = event['time']
        
        # 1. Location Resolution
        resolved_junction = find_closest_junction(lat, lon)
        
        # 2. Model Prediction
        day_of_week = datetime.now().weekday()
        is_rush_hour = 1 if hour in [17, 18, 19] else 0
        
        try:
            v_type_enc = config.le_type.transform([violation_type_raw])[0]
        except ValueError:
            v_type_enc = 0
            
        try:
            junc_enc = config.le_junction.transform([resolved_junction])[0]
        except ValueError:
            junc_enc = 0
            
        df = pd.DataFrame([{
            'violation_type_encoded': v_type_enc,
            'junction_name_encoded': junc_enc,
            'hour': hour,
            'day_of_week': day_of_week,
            'is_rush_hour': is_rush_hour
        }])
        
        score_val = float(config.impact_scorer.predict_proba(df)[0][1] * 100)
        score = round(score_val, 2)
        score_color = "red" if score > 75 else "yellow" if score > 50 else "green"
        
        # 3. BFS Cascade Simulation Setup
        cascade_path = [resolved_junction]
        queue = [(resolved_junction, 0)]
        max_depth = int(score / 25) + 1
        
        edges = config.network_graph.get('edges', [])
        node_map = {n['id']: n['name'] for n in config.network_graph.get('nodes', [])}
        name_to_id = {n['name']: n['id'] for n in config.network_graph.get('nodes', [])}
        
        # ALWAYS Simulate spread to see what the potential escalation is
        while queue and len(cascade_path) < 25:
            current, depth = queue.pop(0)
            if depth >= max_depth:
                continue
                
            current_id = name_to_id.get(current)
            neighbors = []
            for e in edges:
                if e['source'] == current_id:
                    neighbors.append(node_map.get(e['target']))
                elif e['target'] == current_id:
                    neighbors.append(node_map.get(e['source']))
                    
            valid_neighbors = [n for n in neighbors if n and n not in cascade_path]
            
            if valid_neighbors:
                num_to_infect = min(len(valid_neighbors), random.choice([1, 2]))
                infected = random.sample(valid_neighbors, num_to_infect)
                for inf in infected:
                    cascade_path.append(inf)
                    queue.append((inf, depth + 1))
        
        # 4. Decision Engine
        is_high_risk = score > 75
        police_busy = random.random() < 0.3
        is_prevented = False
        
        if is_high_risk:
            if police_busy:
                result_msg = "[bold yellow]DISPATCH FAILED (Units Busy)[/bold yellow]"
                missed_count += 1
            else:
                result_msg = "[bold green]UNIT DISPATCHED[/bold green]"
                prevented_count += 1
                is_prevented = True
        else:
            result_msg = "[dim]IGNORED (Low Risk)[/dim]"
            missed_count += 1

        # Only record global infections if it wasn't prevented
        if not is_prevented:
            for node in cascade_path:
                if node not in global_infected_nodes:
                    global_infected_nodes[node] = []
                global_infected_nodes[node].append(f"Tick {i+1}")
                
        # Minimal Print matching the requested flow
        if is_prevented:
            spread_msg = f"-> [green]Prevented gridlock at {len(cascade_path)} connected junctions[/green]"
        else:
            spread_msg = f"-> [red]Gridlock cascaded to {len(cascade_path)} junctions[/red]"
            
        short_junc = resolved_junction.split('-')[0].strip() if '-' in resolved_junction else resolved_junction[:15]
        
        log_line = f"[cyan]Tick {i+1:03d}[/cyan] | Sees: [bold]{short_junc:<10}[/bold] | Model Escalation Check: [{score_color}]{score:05.2f}[/{score_color}] | Action: {result_msg:<40} {spread_msg}"
        console.print(log_line)
        
        if not run_all and i < len(events) - 1:
            response = Prompt.ask("   [dim]Press Enter to step, 'r' to run all, 'q' to quit[/dim]")
            if response.lower() == 'q':
                break
            elif response.lower() == 'r':
                run_all = True
        elif run_all:
            time.sleep(0.01)
            
    # Final Summary Report
    console.print("\n")
    console.rule("[bold magenta]GLOBAL SIMULATION SUMMARY REPORT[/bold magenta]")
    
    total_table = Table(show_header=False, box=None)
    total_table.add_column("Metric", style="cyan")
    total_table.add_column("Value", style="white")
    total_table.add_row("Total Random Events Simulated", str(len(events)))
    total_table.add_row("Total Cascades Prevented (Units Dispatched)", f"[green]{prevented_count}[/green]")
    total_table.add_row("Total Gridlocks Missed (Ignored/Busy)", f"[red]{missed_count}[/red]")
    total_table.add_row("Total Infrastructure Nodes Infected", str(len(global_infected_nodes)))
    
    console.print(Panel(total_table, title="Overall Statistics", border_style="magenta"))
    
    # Calculate connecting violations
    overlapping_nodes = {node: evs for node, evs in global_infected_nodes.items() if len(evs) > 1}
    
    if overlapping_nodes:
        conn_table = Table(title=f"Connecting Violations: {len(overlapping_nodes)} Nodes hit by multiple cascading gridlocks", title_style="bold red")
        conn_table.add_column("Junction Name", style="bold white")
        conn_table.add_column("Hit By", style="yellow")
        
        # Sort by most hit
        sorted_overlaps = sorted(overlapping_nodes.items(), key=lambda x: len(x[1]), reverse=True)
        for node, evs in sorted_overlaps[:15]:
            conn_table.add_row(node, ", ".join(evs))
            
        console.print(conn_table)
        if len(sorted_overlaps) > 15:
            console.print(f"[dim]...and {len(sorted_overlaps) - 15} more connecting junctions[/dim]")
    else:
        console.print("[green]No connecting gridlock overlaps detected in this simulation run![/green]")
        
    console.print()

if __name__ == "__main__":
    run_tui()
