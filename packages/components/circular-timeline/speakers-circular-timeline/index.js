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
      const TIMELINE_SEGMENT_LENGTH = 1800;
      const totalCircles = timecodeToSeconds(this.props.mediaDuration);
  
      for (let circleTime = 0; circleTime < totalCircles; circleTime++) {
        const isTalkMoment = this.state.startsObj.hasOwnProperty(circleTime);
        if(isTalkMoment){
        circles.push(
          <div key={`speaker_${this.state.speaker}_${circleTime}`} className={styles.circleItemContainer}>
            <div title={`${secondsToTimecode(this.state.startsObj[circleTime])}`} className={styles.circleItem} style={{ left: `${(circleTime / TIMELINE_SEGMENT_LENGTH) * 98}%`, backgroundColor: this.state.color, cursor: 'pointer' }} onClick={()=>this.props.setCurrentTime(this.state.startsObj[circleTime])}/>
          </div>
        );
        }
  
        // Connect circles with lines, excluding the last circle
        // if (i < totalCircles - 1) {
        //   circles.push(
        //     <svg key={`line-${i}`} className={styles.timelineLine} style={{ left: `${((i + 0.5) / totalCircles) * 98}%` }}>
        //       <line x1="0" y1="50%" x2="100%" y2="50%" />
        //     </svg>
        //   );
        // }
      }
  
      return circles;
    };
     
    return (
    <tr className={styles.tableRow}>
        <td className={styles.tableSpeaker}>
         <p> {this.state.speaker.substring(0, 5)} </p>
        </td>
        <td className={styles.circleContainer} >
              {renderCircleTimeline()}
      </td>
      {/* <td style={{ left: `${(circleTime / TIMELINE_SEGMENT_LENGTH) * 98}%`, borderBo: "1px solid #ccc" }}/> */}
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
