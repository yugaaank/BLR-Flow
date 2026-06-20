import json
import pandas as pd

with open('models/network_graph.json', 'r') as f:
    graph = json.load(f)
nodes = [n['name'] for n in graph['nodes']]

df = pd.read_csv('../Banglore_traffic_Dataset.csv')
roads = df['Road/Intersection Name'].unique()

print('Nodes sample:', nodes[:5])
print('Roads sample:', roads[:5])

overlap = set(nodes).intersection(set(roads))
print('Overlap count:', len(overlap))

if len(overlap) == 0:
    print("Trying substring match...")
    matches = 0
    for r in roads:
        for n in nodes:
            if r.lower() in n.lower() or n.lower() in r.lower():
                matches += 1
                break
    print(f"Substring matches: {matches} out of {len(roads)}")
