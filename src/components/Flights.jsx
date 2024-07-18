import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const europeTimezones = [
    'Europe/Andorra', 'Europe/Tirane', 'Europe/Vienna', 'Europe/Minsk',
    'Europe/Brussels', 'Europe/Sofia', 'Europe/Prague', 'Europe/Copenhagen',
    'Europe/Tallinn', 'Europe/Helsinki', 'Europe/Paris', 'Europe/Berlin',
    'Europe/Athens', 'Europe/Budapest', 'Europe/Reykjavik', 'Europe/Dublin',
    'Europe/Rome', 'Europe/Riga', 'Europe/Vaduz', 'Europe/Vilnius',
    'Europe/Luxembourg', 'Europe/Malta', 'Europe/Chisinau', 'Europe/Monaco',
    'Europe/Amsterdam', 'Europe/Oslo', 'Europe/Warsaw', 'Europe/Lisbon',
    'Europe/Bucharest', 'Europe/Moscow', 'Europe/San_Marino', 'Europe/Belgrade',
    'Europe/Bratislava', 'Europe/Ljubljana', 'Europe/Madrid', 'Europe/Stockholm',
    'Europe/Zurich', 'Europe/Kiev', 'Europe/London', 'Europe/Vatican', 'Atlantic/Canary'
  ];

  const spainAirports = [
    'ZAZ', 'VIT', 'VGO', 'VLL', 'VLC', 'TOJ', 'TEV', 'TFS', 'TFN', 'SVQ', 'SCQ', 'SDR',
    'EAS', 'MJV', 'SLM', 'QSA', 'ROZ', 'REU', 'RMU', 'LEU', 'POS', 'PNA', 'PMI', 'AGP',
    'OZP', 'MAH', 'MLN', 'RJL', 'ILD', 'LEN', 'ACE', 'SPC', 'GMZ', 'XRY', 'IBZ', 'HSK',
    'VDE', 'LPA', 'GRO', 'FUE', 'GRX', 'ODB', 'ECV', 'CQM', 'CDT', 'RGS', 'BIO', 'BCN',
    'BJZ', 'OVD', 'LEI', 'ALC', 'AEI', 'ABC', 'MAD', 'LCG'
  ];

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    let allFlights = [];
    let idCounter = 1; // Initial id counter
  
    try {
      for (const airport of spainAirports) {
        const response = await axios.get('https://api.aviationstack.com/v1/flights', {
          params: {
            access_key: 'ACCESS_KEY',
            flight_date: '2023-12-29',
            // dep_iata: airport,
            arr_iata: airport,
            limit: 10000
          }
        });
  
        if (response.status === 200 && response.data.data.length > 0) {
          const flightsData = response.data.data;
  
          const filteredFlights = flightsData.filter(
            flight =>
              europeTimezones.includes(flight.departure.timezone) &&
              europeTimezones.includes(flight.arrival.timezone)
          );
  
          // Add id to each flight object
          const flightsWithId = filteredFlights.map(flight => ({
            ...flight,
            id: idCounter++
          }));
  
          allFlights = [...allFlights, ...flightsWithId];
        }
      }
  
      setFlights(allFlights);
      console.log('Full API response:', allFlights);
    } catch (error) {
      console.error("Error fetching flight data", error);
      setError(error);
    }
  
    setLoading(false);
  };
  

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(flights.map(flight => ({
      FlightIATA: flight.flight.iata,
      FlightStatus: flight.flight_status,
      DepartureAirport: flight.departure.airport,
      ArrivalAirport: flight.arrival.airport,
      DepartureIATA: flight.departure.iata,
      DepartureICAO: flight.departure.icao,
      ActualDeparture: flight.departure.actual,
      ActualArrival: flight.arrival.actual,
      ArrivalIATA: flight.arrival.iata,
      ArrivalICAO: flight.arrival.icao,
      AirlineName: flight.airline.name,
      FlightNumber: flight.flight.number,
      DepartureDelay: flight.departure.delay,
      ArrivalDelay: flight.arrival.delay,
      DepartureEstimated: flight.departure.estimated,
      ArrivalEstimated: flight.arrival.estimated,
      DepartureScheduled: flight.departure.scheduled,
      ArrivalScheduled: flight.arrival.scheduled
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flights");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "flights_data.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToDatabase = async () => {
    try {
      const response = await axios.post('http://localhost:5000/saveFlights', {
        flights: flights
      });
      if (response.status === 200) {
        console.log('Data saved successfully');
      } else {
        console.error('Error saving data', response);
      }
    } catch (error) {
      console.error('Error saving data to database', error);
    }
  };

  return (
    <div>
      <h3>Flights Data</h3>
      <button onClick={fetchFlights} disabled={loading}>
        {loading ? "Loading..." : "Fetch Flights"}
      </button>
      <button onClick={downloadExcel} disabled={flights.length === 0}>
        Download Excel
      </button>
      <button onClick={saveToDatabase} disabled={flights.length === 0}>
        Save to Database
      </button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!loading && !error && flights.length === 0 && <div>No flight data available.</div>}
      {!loading && !error && flights.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Flight IATA</th>
              <th>Flight Status</th>
              <th>Departure Airport</th>
              <th>Arrival Airport</th>
              <th>Departure IATA</th>
              <th>Departure ICAO</th>
              <th>Departure Actual</th>
              <th>Arrival Actual</th>
              <th>Arrival IATA</th>
              <th>Arrival ICAO</th>
              <th>Airline Name</th>
              <th>Flight Number</th>
              <th>Departure Delay</th>
              <th>Arrival Delay</th>
              <th>Scheduled Departure</th>
              <th>Scheduled Arrival</th>
              <th>Estimated Departure</th>
              <th>Estimated Arrival</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.flight.iata}>
                <td>{flight.flight.iata}</td>
                <td>{flight.flight_status}</td>
                <td>{flight.departure.airport}</td>
                <td>{flight.arrival.airport}</td>
                <td>{flight.departure.iata}</td>
                <td>{flight.departure.icao}</td>
                <td>{flight.departure.actual}</td>
                <td>{flight.arrival.actual}</td>
                <td>{flight.arrival.iata}</td>
                <td>{flight.arrival.icao}</td>
                <td>{flight.airline.name}</td>
                <td>{flight.flight.number}</td>
                <td>{flight.departure.delay}</td>
                <td>{flight.arrival.delay}</td>
                <td>{flight.departure.scheduled}</td>
                <td>{flight.arrival.scheduled}</td>
                <td>{flight.departure.estimated}</td>
                <td>{flight.arrival.estimated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Flights;
