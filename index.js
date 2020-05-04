import React from 'react';
import './index.css';
import ReactDOM from 'react-dom';
import * as moment from 'moment';

const timeRate = 1000;

const Header = () => <h1 className="header">Pomodoro Clock</h1>

const SetTimer = ({ type, value, handleClick }) => (
    <div className="setTimer">
        <div id={`${type}-label`}>{type === "session" ? "Session " : "Break "}</div>
        <div className="setTimer-controls">
            <button id={`${type}-decrement`} onClick={() => handleClick(false, `${type}Value`)}>&#8595;</button>
            <h1 id={`${type}-length`}>{value}</h1>
            <button id={`${type}-increment`} onClick={() => handleClick(true, `${type}Value`)}>&#8593;</button>
        </div>
    </div>
)

const Timer = ({ mode, time }) => (
    <div className="timer">
        <h1 id="timer-label">{mode === "session" ? "Session" : "Break"}</h1>
        <h1 id="time-left">{time}</h1>
    </div>
)

const Controls = ({ active, handleReset, handlePlayPause }) => (
    <div className="controls">
        <button
            id="start_stop"
            onClick={handlePlayPause}>{active ? <span>&#10074;&#10074;</span> : <span>&#9658;</span>}
        </button>
        <button
            id="reset"
            onClick={handleReset}>&#8634;
        </button>
    </div>
)

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            breakValue: 5,
            sessionValue: 25,
            mode: "session",
            time: 25 * 60 * 1000,
            active: false,
            touched: false
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.time === 0 && prevState.mode === "session") {
            this.setState({
                time: this.state.breakValue * 60 * 1000,
                mode: "break",
            })
            this.audio.play()
        }
        if (prevState.time === 0 && prevState.mode === "break") {
            this.setState({
                time: this.state.sessionValue * 60 * 1000,
                mode: "session",
            })
            this.audio.play()
        }
    }

    handleSetTimers = (inc, type) => {
        if (this.state[type] === 60 && inc) return
        if (this.state[type] === 1 && !inc) return
        let newValue = this.state[type] + (inc ? 1 : -1);
        if (type === "sessionValue") {
            this.setState({
                sessionValue: newValue,
                time: newValue * 60 * 1000
            })
        } else {
            this.setState({
                breakValue: newValue
            })
        }
    }

    handleReset = () => {
        this.setState({
            breakValue: 5,
            sessionValue: 25,
            time: 25 * 60 * 1000,
            active: false,
            mode: 'session',
            touched: false
        })
        this.audio.pause()
        this.audio.currentTime = 0
        clearInterval(this.pomodoro)
    }

    handlePlayPause = () => {
        console.log(this.state)
        if (this.state.active) {
            this.setState({ active: false }, () => clearInterval(this.pomodoro))
        }
        else {
            if (!this.state.touched) {
                this.setState({
                    time: this.state.sessionValue * 60 * 1000,
                    active: true,
                    touched: true
                }, () => this.pomodoro = setInterval(() => this.setState({ time: this.state.time - 1000 }), timeRate)
                )
            } else {
                this.setState({
                    active: true,
                    touched: true
                }, () => this.pomodoro = setInterval(() => this.setState({ time: this.state.time - 1000 }), timeRate))
            }
        }
    }

    formatTime = () => {
        let time = moment(this.state.time).format('mm:ss')
        if (time === "00:00" && this.state.sessionValue === 60) {
            return "60:00"
        } else {
            return time;
        }
    }

    render() {
        return (
            <div>
                <Header />
                <div className="settings">
                    <SetTimer type="break" value={this.state.breakValue} handleClick={this.handleSetTimers} />
                    <SetTimer type="session" value={this.state.sessionValue} handleClick={this.handleSetTimers} />
                </div>
                <Timer mode={this.state.mode}
                    time={this.formatTime()} />
                <Controls
                    active={this.state.active}
                    handleReset={this.handleReset}
                    handlePlayPause={this.handlePlayPause} />
                <audio id="beep" src="https://freesound.org/data/previews/80/80921_1022651-lq.mp3" ref={element => this.audio = element}></audio>
            </div>

        )
    }
}

ReactDOM.render(<App />, document.getElementById("root"))