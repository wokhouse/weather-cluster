import React, {Component} from 'react';
import math from 'mathjs';
import {fetchWeather} from './api';
import Graph from './components/Graph';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loaded: false,
      error: null,
      data: null,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount() {
    // fetch weather, then send to state
    fetchWeather()
      .then(data => {
        const temps = data.map(s => s.climo_high_f);
        const precip = data.map(s => s.climo_precip_in);
        const tempMean = math.mean(temps);
        const tempMax = math.max(temps);
        const tempMin = math.min(temps);
        const precipMean = math.mean(precip);
        const precipMax = math.max(precip);
        const precipMin = math.min(precip);
        console.log(precipMin,precipMax)
        this.setState({
          loading: false,
          loaded: true,
          error: null,
          data,
          tempCutoff: tempMean,
          precipCutoff: precipMean,
          tempMin,
          tempMax,
          precipMin,
          precipMax,
        });
      })
      // catch errors if there is an api error
      .catch(err => {
        this.setState({
          loading: false,
          loaded: false,
          error: err,
          data: null,
        });
      });
  }
  handleChange(e) {
    const key = e.target.dataset.key;
    const newState = {}
    newState[key] = e.target.value
    this.setState(newState);
  }
  render() {
    let mapData, tempMean, precipMean;
    if (this.state.data) {
      mapData = this.state.data.map(s => ({
        stid: s.station,
        type: 'station',
        size: (s.climo_precip_in > this.state.precipCutoff) ? 1 : 0,
        color: (s.climo_high_f > this.state.tempCutoff) ? 1 : 0,
        y: s.lat,
        x: s.lon,
      }));
    }
    return (
      <div
        className="App"
        style={{
          marginTop: 10,
          textAlign: 'center',
          paddingTop: 10,
        }}>
        {this.state.error ? (
          <div className="alert alert-danger">
            {JSON.stringify(this.state.error)}
          </div>
        ) : null}
        {this.state.loaded && !this.state.error && this.state.data ? (
          <div>
            <div>
              <h1>JANUARY FIRST 2018'S WEATHER DICHOTOMY</h1>
              <h2>IN OREGON</h2>
              <h3>key</h3>
              <ul style={{ listStyle: 'none' }}>
                <li>big blue circle: COLD AND RAINY</li>
                <li>big orange circle: HOT AND RAINY</li>
                <li>small blue circle: COLD AND DRY</li>
                <li>small orange circle: HOT AND DRY</li>
              </ul>
            </div>
            <Graph mapData={mapData} />
            <div>
              adjust temperature dichotomy
              <input
                type="range"
                min={this.state.tempMin}
                max={this.state.tempMax}
                data-key="tempCutoff"
                value={this.state.tempCutoff}
                onChange={this.handleChange}
              />
              {this.state.tempCutoff} degrees fair'n'height
            </div>
            <div>
              adjust precip dichotomy
              <input
                type="range"
                min={this.state.precipMin}
                max={this.state.precipMax}
                data-key="precipCutoff"
                step="0.001"
                value={this.state.precipCutoff}
                onChange={this.handleChange}
              />
              {this.state.precipCutoff} inches
            </div>
          </div>
        ) : (
          <h2>Loading...</h2>
        )}
      </div>
    );
  }
}

export default App;
