import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
// import { secondsToTimecode, timecodeToSeconds } from ;

import { secondsToTimecode, timecodeToSeconds } from '../../../util/timecode-converter/index.js';

class SpeakersCircularTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state= { 
      speaker: this.props.speaker,
      startsObj: this.props.startsObj,
      color: this.getRandomColor(),
    }
  }

  getRandomColor = () => {
  let color = '#';

  // Function to calculate a random value excluding the range [220, 255] (whitish colors)
  const getRandomValue = () => Math.floor(Math.random() * 220);

  // Generate random values for red, green, and blue
  const red = getRandomValue().toString(16).padStart(2, '0');
  const green = Math.floor(Math.random() * 150).toString(16).padStart(2, '0'); // Limit green to a certain range
  const blue = getRandomValue().toString(16).padStart(2, '0');

  color = `#${red}${green}${blue}`;

  return color;
  };


  render() {

    const renderCircleTimeline = () => {
      const circles = [];
      const totalCircles = timecodeToSeconds(this.props.mediaDuration);
  
      for (let circleTime = 0; circleTime < totalCircles; circleTime++) {
        const isTalkMoment = this.state.startsObj.hasOwnProperty(circleTime);
        const isMajorLine = (circleTime % 60) === 0;
        const isMinLine = (circleTime % 10) === 0;

        const lineStyle = {
          height: isMajorLine ? '10px' : '5px', 
          
        };

        circles.push(
              <div style={{display: "flex", flexDirection:"column", alignItems: "end", marginLeft: `0.5px`, maxHeight:"20px"}}>
                <div  style={{minHeight: "10px", marginTop:"7px", cursor: isTalkMoment? 'pointer':'', maxWidth: "1px"}} title={`${secondsToTimecode(this.state.startsObj[circleTime])}`} onClick={()=> { if(isTalkMoment) this.props.setCurrentTime(this.state.startsObj[circleTime])}}>
                  {isMinLine && <div className={styles.circleItem} style={{...lineStyle, backgroundColor: isTalkMoment? this.state.color: "#ccc"}} />}
                </div> 
              </div>
        );
      }
  
      return circles;
    };
     
    return (
    <tr className={styles.tableRow}>
        <td className={styles.tableSpeaker}>
         <div style={{ maxWidth: "4em", minWidth:"4em"}}>
         {this.state.speaker.substring(0, 5)}
         </div>
        </td>
        <td className={styles.circleContainer} >
        <div style={{display: "flex", flexDirection:"row", position:"relative"}}>{renderCircleTimeline()}</div>
      </td>
      </tr>
    );
  }
}

// SpeakersCircularTimeLine.propTypes = {
//   currentTime: PropTypes.number,
//   videoRef: PropTypes.object.isRequired,
//   handleAnalyticsEvents: PropTypes.func,
//   mediaDuration: PropTypes.string
// };

export default SpeakersCircularTimeLine;
