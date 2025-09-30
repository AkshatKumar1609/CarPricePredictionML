import './App.css';
import React, { useState, useEffect } from "react";

function App() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    year: "",
    kms_driven: "",
    fuel_type: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdown options
  const [names, setNames] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [years, setYears] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  useEffect(() => {
    fetch("/Cleaned_Car.csv")
      .then((res) => res.text())
      .then((csv) => {
        const lines = csv.split("\n").slice(1);
        const nameSet = new Set();
        const companySet = new Set();
        const yearSet = new Set();
        const fuelTypeSet = new Set();
        const allNamesArr = [];
        lines.forEach((line) => {
          const cols = line.split(",");
          if (cols.length < 7) return;
          const name = cols[1].trim();
          const company = cols[2].trim();
          nameSet.add(name);
          companySet.add(company);
          yearSet.add(cols[3].trim());
          fuelTypeSet.add(cols[6].trim());
          allNamesArr.push({ name, company });
        });
        setAllNames(allNamesArr);
        setNames(Array.from(nameSet).sort());
        setCompanies(Array.from(companySet).sort());
        setYears(Array.from(yearSet).sort((a, b) => b - a));
        setFuelTypes(Array.from(fuelTypeSet).sort());
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "company") {
      setForm((prev) => ({ ...prev, company: value, name: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          year: Number(form.year),
          kms_driven: Number(form.kms_driven),
          fuel_type: form.fuel_type
        })
      });
      const data = await response.json();
      if (data.predicted_price !== undefined && data.predicted_price !== null) {
        if (data.predicted_price < 0) {
          setError("Predicted price is very low.");
        } else {
          setResult(`Predicted Price: ₹${data.predicted_price}`);
        }
      } else if (data.message) {
        setResult(data.message);
      } else {
        setError(data.error || "Prediction failed.");
      }
    } catch (err) {
      setError("Could not connect to prediction server.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="background-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <div className="main-card">
        <div className="header-section">
          <div className="icon-container">
            <svg className="car-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="title">Car Price Predictor</h1>
          <p className="subtitle">Get instant price estimates for used cars</p>
        </div>

        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">
                <span className="label-text">Company</span>
                <select
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Choose brand</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                <span className="label-text">Car Model</span>
                <select
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={!form.company}
                  className={`form-select ${!form.company ? 'disabled' : ''}`}
                >
                  <option value="">Select model</option>
                  {allNames
                    .filter((item) => item.company === form.company)
                    .map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">
                <span className="label-text">Year</span>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                <span className="label-text">Fuel Type</span>
                <select
                  name="fuel_type"
                  value={form.fuel_type}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Choose fuel</option>
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="input-group full-width">
            <label className="input-label">
              <span className="label-text">Kilometers Driven</span>
              <input
                type="number"
                name="kms_driven"
                placeholder="Enter total kilometers"
                value={form.kms_driven}
                onChange={handleChange}
                required
                min={0}
                className="form-input"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`predict-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Calculating...
              </>
            ) : (
              <>
                <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                Predict Price
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="result success">
            <div className="result-icon">💰</div>
            <div>
              <div className="result-label">Estimated Price</div>
              <div className="result-value">{result}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="result error">
            <div className="result-icon">⚠️</div>
            <div className="result-message">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;