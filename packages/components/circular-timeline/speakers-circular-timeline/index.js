import React from 'react';
import PropTypes from 'prop-types';
import styles from '../index.module.css';
import { secondsToTimecode, timecodeToSeconds } from '../../util/timecode-converter';


class SpeakersCircularTimeLine extends React.Component {
  constructor(props) {
    super(props);

  }


  render() {

    const renderCircleTimeline = () => {
      const circles = [];
      const TIMELINE_SEGMENT_LENGTH = 1800;
      const totalCircles = timecodeToSeconds(this.props.mediaDuration);
      
  
      for (let i = 0; i < totalCircles; i++) {
        const isMajorLine = (i % 60) === 0;
        // const minute = i / 60;
        // TODO: tooltip for the speaker and the minute
        circles.push(
          <>
          {isMajorLine && <div key={i} className={styles.circleItem} style={{ left: `${(i / TIMELINE_SEGMENT_LENGTH) * 98}%`, backgroundColor: "#3498db" }}/>}
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
