import pandas as pd
import numpy as np

def load_data():
    df = pd.read_csv('data/food_orders.csv')
    
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Clean weather (remove 'conditions ' prefix)
    df['Weatherconditions'] = df['Weatherconditions'].str.replace('conditions ', '').str.strip()
    
    # Convert ratings to numeric
    df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
    df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
    df['Time_taken(min)'] = pd.to_numeric(df['Time_taken(min)'].astype(str).str.extract(r'(\d+)')[0], errors='coerce')
    
    df.dropna(subset=['Time_taken(min)'], inplace=True)
    return df