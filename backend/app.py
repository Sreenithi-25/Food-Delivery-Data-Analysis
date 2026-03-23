from flask import Flask, jsonify, request
from flask_cors import CORS
from data_loader import load_data

app = Flask(__name__)
CORS(app)

df = load_data()

@app.route('/api/summary')
def summary():
    return jsonify({
        "total_orders": int(df.shape[0]),
        "avg_delivery_time": round(float(df['Time_taken(min)'].mean()), 1),
        "avg_rating": round(float(df['Delivery_person_Ratings'].mean()), 2),
        "avg_age": round(float(df['Delivery_person_Age'].mean()), 1)
    })

@app.route('/api/orders-by-vehicle')
def orders_by_vehicle():
    counts = df['Type_of_vehicle'].value_counts()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/orders-by-weather')
def orders_by_weather():
    counts = df['Weatherconditions'].value_counts()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/orders-by-traffic')
def orders_by_traffic():
    counts = df['Road_traffic_density'].value_counts()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/delivery-time-by-weather')
def delivery_time_by_weather():
    grouped = df.groupby('Weatherconditions')['Time_taken(min)'].mean().round(1)
    return jsonify({"labels": grouped.index.tolist(), "values": grouped.tolist()})

@app.route('/api/delivery-time-by-traffic')
def delivery_time_by_traffic():
    order = ['Low', 'Medium', 'High', 'Jam']
    grouped = df.groupby('Road_traffic_density')['Time_taken(min)'].mean().round(1)
    grouped = grouped.reindex([o for o in order if o in grouped.index])
    return jsonify({"labels": grouped.index.tolist(), "values": grouped.tolist()})

@app.route('/api/orders-by-city')
def orders_by_city():
    counts = df['City'].value_counts()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/orders-by-type')
def orders_by_type():
    counts = df['Type_of_order'].value_counts()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/rating-distribution')
def rating_distribution():
    counts = df['Delivery_person_Ratings'].value_counts().sort_index()
    return jsonify({"labels": counts.index.tolist(), "values": counts.tolist()})

@app.route('/api/festival-comparison')
def festival_comparison():
    grouped = df.groupby('Festival')['Time_taken(min)'].mean().round(1)
    return jsonify({"labels": grouped.index.tolist(), "values": grouped.tolist()})

@app.route('/api/multiple-deliveries')
def multiple_deliveries():
    grouped = df.groupby('multiple_deliveries')['Time_taken(min)'].mean().round(1)
    return jsonify({"labels": [str(x) for x in grouped.index.tolist()], "values": grouped.tolist()})

@app.route('/api/vehicle-condition')
def vehicle_condition():
    grouped = df.groupby('Vehicle_condition')['Time_taken(min)'].mean().round(1).sort_index()
    return jsonify({"labels": [str(x) for x in grouped.index.tolist()], "values": grouped.tolist()})

@app.route('/api/filtered')
def filtered():
    city    = request.args.get('city', 'All')
    traffic = request.args.get('traffic', 'All')
    weather = request.args.get('weather', 'All')

    filtered_df = df.copy()
    if city    != 'All': filtered_df = filtered_df[filtered_df['City'] == city]
    if traffic != 'All': filtered_df = filtered_df[filtered_df['Road_traffic_density'] == traffic]
    if weather != 'All': filtered_df = filtered_df[filtered_df['Weatherconditions'] == weather]

    return jsonify({
        "total_orders":      int(filtered_df.shape[0]),
        "avg_delivery_time": round(float(filtered_df['Time_taken(min)'].mean()), 1) if len(filtered_df) else 0,
        "avg_rating":        round(float(filtered_df['Delivery_person_Ratings'].mean()), 2) if len(filtered_df) else 0,
        "vehicle":    filtered_df['Type_of_vehicle'].value_counts().to_dict(),
        "traffic":    filtered_df['Road_traffic_density'].value_counts().to_dict(),
        "weather":    filtered_df['Weatherconditions'].value_counts().to_dict(),
        "order_type": filtered_df['Type_of_order'].value_counts().to_dict(),
        "city":       filtered_df['City'].value_counts().to_dict(),
    })

@app.route('/api/filter-options')
def filter_options():
    return jsonify({
        "cities":   sorted(df['City'].dropna().unique().tolist()),
        "traffic":  sorted(df['Road_traffic_density'].dropna().unique().tolist()),
        "weather":  sorted(df['Weatherconditions'].dropna().unique().tolist()),
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)