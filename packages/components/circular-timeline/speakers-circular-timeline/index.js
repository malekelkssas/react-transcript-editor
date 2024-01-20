import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
// import { secondsToTimecode, timecodeToSeconds } from ;

// import ToolTip from '../tooltip/index.js';
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

  

  // speaker, [starts]


  render() {

    const renderCircleTimeline = () => {
      const circles = [];
      const TIMELINE_SEGMENT_LENGTH = 1800;
      const totalCircles = timecodeToSeconds(this.props.mediaDuration);
  
      for (let circleTime = 0; circleTime < totalCircles; circleTime++) {
        // hasOwn = (obj, key) => Object.prototype..call(obj, key);
        const isTalkMoment = this.state.startsObj.hasOwnProperty(circleTime);
        
        circles.push(
          <>
          {isTalkMoment && 
            <div title={`${this.state.speaker}\n${secondsToTimecode(this.state.startsObj[circleTime])}`} key={`speaker_${this.state.speaker}_${circleTime}`} className={styles.circleItem} style={{ left: `${(circleTime / TIMELINE_SEGMENT_LENGTH) * 98}%`, backgroundColor: this.state.color, cursor: 'pointer' }} onClick={()=>this.props.setCurrentTime(this.state.startsObj[circleTime])}/>
          }
          </>
        );
  
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
    <div className={styles.circleContainer}>
        {renderCircleTimeline()}
    </div>
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
