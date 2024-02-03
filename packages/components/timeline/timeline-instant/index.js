import React from "react";
import PropTypes from 'prop-types';
import styles from "./index.module.css";

class TimeLineInstant extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        isActive: false,
      }
        this.timeLineInstant = this.props.timeLineInstant;
        this.isMinLine = this.props.isMinLine;
        this.isMajorLine = this.props.isMajorLine;
        this.minuteNumber = this.props.minuteNumber;
    }

    componentDidUpdate() {
        if (( this.props.videoRef.current.currentTime >= this.timeLineInstant && !this.state.isActive) || ( this.props.videoRef.current.currentTime < this.timeLineInstant && this.state.isActive) && (this.isMajorLine || this.isMinLine)) {
          this.setState({isActive: !this.state.isActive});
        }
      }


    render() {
        const { isActive } = this.state;
        return (
        <div className={styles.lineNumberContainer} onClick={()=>this.props.setCurrentTime(this.timeLineInstant)}>
            <div className={styles.lineContainer} >
                {this.isMinLine && <div className={styles.timeLineLine} style={{height: this.isMajorLine ? '10px' : '5px', backgroundColor: isActive?"#084cc9":""}}/>}
            </div> 
            <div className={styles.numberContainer}>
                {this.isMajorLine && <div className={styles.timeLineNumber} >{this.minuteNumber}</div>}
            </div> 
        </div>
        );
    }
}

TimeLineInstant.propTypes = {
  timeLineInstant: PropTypes.number.isRequired,
  isMinLine: PropTypes.bool.isRequired,
  isMajorLine: PropTypes.bool.isRequired,
  setCurrentTime: PropTypes.func.isRequired,
  videoRef: PropTypes.object.isRequired,
  minuteNumber: PropTypes.number.isRequired,
};

export default TimeLineInstant;